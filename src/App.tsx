import { useRef, useState } from 'react'
import {
  ArrowDown, ArrowRight, BadgeCheck, BriefcaseBusiness, Check, ChevronDown,
  FileText, FileUp, LoaderCircle, LockKeyhole, Sparkles, Target, X,
} from 'lucide-react'
import { AnalysisDashboard } from './components/AnalysisDashboard'
import { createDemoAnalysis, isAnalysisResult } from './lib/demoAnalysis'
import type { AnalysisResult } from './types'
import './App.css'

const MAX_FILE_SIZE = 8 * 1024 * 1024

async function extractText(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (extension === 'pdf') {
    const [{ getDocument, GlobalWorkerOptions }, worker] = await Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
    ])
    GlobalWorkerOptions.workerSrc = worker.default
    const pdf = await getDocument({ data: await file.arrayBuffer() }).promise
    const pages = await Promise.all(
      Array.from({ length: pdf.numPages }, async (_, index) => {
        const page = await pdf.getPage(index + 1)
        const content = await page.getTextContent()
        return content.items.map((item) => ('str' in item ? `${item.str}${item.hasEOL ? '\n' : ' '}` : '')).join('')
      }),
    )
    return pages.join('\n')
  }
  if (extension === 'docx') {
    const mammoth = await import('mammoth')
    const result = await mammoth.default.extractRawText({ arrayBuffer: await file.arrayBuffer() })
    return result.value
  }
  throw new Error('Please choose a PDF or DOCX file.')
}

function App() {
  const [resumeText, setResumeText] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [fileName, setFileName] = useState('')
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [demoMode, setDemoMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const uploadRef = useRef<HTMLElement>(null)

  async function handleFile(file?: File) {
    if (!file) return
    setError('')
    if (!/\.(pdf|docx)$/i.test(file.name)) {
      setError('That file type is not supported. Choose a PDF or DOCX resume.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('This file is larger than 8 MB. Choose a smaller resume.')
      return
    }
    try {
      const text = await extractText(file)
      if (!text.trim()) {
        setError('No readable text was found. Try a text-based PDF or paste your resume below.')
        return
      }
      setResumeText(text.slice(0, 50000))
      setFileName(file.name)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'We could not read that file.')
    }
  }

  async function analyzeResume() {
    const text = resumeText.trim()
    if (text.length < 80) {
      setError('Add at least a few sentences about your experience (80 characters minimum).')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: text, targetRole: targetRole.trim() }),
      })
      if (!response.ok) {
        const message = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(message?.error ?? 'Analysis could not be completed. Please try again.')
      }
      const result = await response.json() as { mode: 'ai' | 'demo'; analysis?: AnalysisResult }
      if (result.mode === 'demo') {
        setDemoMode(true)
        setAnalysis(createDemoAnalysis(text, targetRole.trim()))
      } else if (result.mode === 'ai' && isAnalysisResult(result.analysis)) {
        setDemoMode(false)
        setAnalysis(result.analysis)
      } else {
        throw new Error('The analysis service returned an invalid response. Please try again.')
      }
      window.setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 80)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Something went wrong while analyzing your resume.')
    } finally {
      setLoading(false)
    }
  }

  function startOver() {
    setAnalysis(null)
    setDemoMode(false)
    setError('')
    setResumeText('')
    setFileName('')
    setTargetRole('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#" aria-label="CareerLens AI home">
          <span className="brand-mark"><Sparkles size={18} /></span>
          <span>CareerLens<span className="brand-ai"> AI</span></span>
        </a>
        <nav className="header-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#features">What you’ll get</a>
        </nav>
        <button className="header-cta" onClick={() => uploadRef.current?.scrollIntoView({ behavior: 'smooth' })}>
          Analyze my resume <ArrowRight size={15} />
        </button>
      </header>

      <main>
        {!analysis ? (
          <>
            <section className="hero-section">
              <div className="hero-copy">
                <div className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT CHAPTER STARTS HERE</div>
                <h1>Turn Your Resume into a <span>Career Roadmap</span></h1>
                <p className="hero-description">
                  Get a clearer picture of your strengths, discover roles that fit, and find your next steps — all from the experience you already have.
                </p>
                <div className="hero-benefits">
                  <span><Check size={15} /> Insights grounded in your resume</span>
                  <span><Check size={15} /> No job listings, just useful direction</span>
                </div>
                <button className="text-link" onClick={() => uploadRef.current?.scrollIntoView({ behavior: 'smooth' })}>
                  See what your resume can do <ArrowDown size={16} />
                </button>
              </div>

              <section className="upload-card" ref={uploadRef} aria-labelledby="upload-title">
                <div className="card-kicker"><span className="step-number">01</span> START WITH YOUR STORY</div>
                <h2 id="upload-title">Let’s make your next move</h2>
                <p className="upload-subtitle">Add your resume and we’ll take it from here.</p>

                <div
                  role="button"
                  tabIndex={0}
                  className={`drop-zone${fileName ? ' has-file' : ''}`}
                  onClick={() => fileInput.current?.click()}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      fileInput.current?.click()
                    }
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => { event.preventDefault(); void handleFile(event.dataTransfer.files[0]) }}
                  aria-label="Choose or drop a PDF or DOCX resume"
                >
                  <input
                    ref={fileInput}
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    hidden
                    onChange={(event) => { void handleFile(event.target.files?.[0]); event.target.value = '' }}
                  />
                  <span className="upload-icon">{fileName ? <FileText size={22} /> : <FileUp size={22} />}</span>
                  <span className="drop-copy">
                    <strong>{fileName || 'Drop your resume here'}</strong>
                    <span>{fileName ? 'Text extracted and ready to analyze' : <>or <span className="browse-link">browse files</span> on your device</>}</span>
                  </span>
                  {fileName && <button className="remove-file" aria-label="Remove uploaded file" onClick={(event) => { event.stopPropagation(); setFileName(''); setResumeText('') }}><X size={16} /></button>}
                </div>
                <div className="file-note"><span>PDF or DOCX · 8 MB max</span><span>Text extraction in browser</span></div>

                <label className="field-label" htmlFor="resume-text">Or paste your resume</label>
                <textarea
                  id="resume-text"
                  className="resume-input"
                  placeholder="Paste your experience, education, skills, projects..."
                  value={resumeText}
                  onChange={(event) => { setResumeText(event.target.value); setFileName(''); setError('') }}
                  maxLength={50000}
                  rows={4}
                />
                <label className="field-label role-label" htmlFor="target-role">
                  Target role <span>OPTIONAL</span>
                </label>
                <div className="role-input-wrap">
                  <BriefcaseBusiness size={16} />
                  <input id="target-role" value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="e.g. Frontend Developer" maxLength={100} />
                  <ChevronDown size={15} className="role-chevron" />
                </div>
                <div className="error-message" role="alert">{error}</div>
                <button className="analyze-button" onClick={() => void analyzeResume()} disabled={loading}>
                  {loading ? <><LoaderCircle className="spin" size={18} /> Reading your resume...</> : <><Sparkles size={17} /> Analyze my resume <ArrowRight size={17} /></>}
                </button>
                <p className="privacy-note"><LockKeyhole size={12} /> Not saved by this app. AI mode sends text to your configured provider.</p>
              </section>
            </section>

            <section className="trust-row" aria-label="Key benefits">
              <div><span className="trust-icon"><BadgeCheck size={18} /></span><span><strong>Honest insights</strong><small>Based on what you’ve shared</small></span></div>
              <div><span className="trust-icon"><Target size={18} /></span><span><strong>Made for your goals</strong><small>Set a role or explore broadly</small></span></div>
              <div><span className="trust-icon"><Sparkles size={18} /></span><span><strong>Clear next steps</strong><small>Turn feedback into progress</small></span></div>
            </section>

            <section className="how-section" id="how-it-works">
              <div className="section-heading">
                <div className="eyebrow">A LITTLE CLARITY GOES A LONG WAY</div>
                <h2>A better next step starts with <span>understanding your story.</span></h2>
              </div>
              <div className="step-grid">
                <article><span className="step-number">01</span><h3>Share your experience</h3><p>Upload a resume or paste your story. Your information stays yours.</p></article>
                <article><span className="step-number">02</span><h3>See your strengths</h3><p>Explore your skills, promising early-career roles, and areas to grow.</p></article>
                <article><span className="step-number">03</span><h3>Choose your next move</h3><p>Leave with focused learning ideas and specific ways to improve your resume.</p></article>
              </div>
            </section>
            <section className="feature-strip" id="features">
              <span><FileText size={17} /> Resume-first feedback</span><span><Target size={17} /> Role fit insights</span><span><Sparkles size={17} /> Actionable suggestions</span>
            </section>
          </>
        ) : (
          <section id="results" className="results-section">
            <div className={`mode-banner ${demoMode ? 'demo' : 'live'}`} role="status">
              <span className="mode-indicator" />
              {demoMode ? <><strong>Demo mode</strong> — these insights are generated from your resume text using local heuristics, not an AI model.</> : <><strong>AI analysis</strong> — insights are generated from your submitted resume.</>}
            </div>
            <AnalysisDashboard analysis={analysis} targetRole={targetRole} onStartOver={startOver} />
          </section>
        )}
      </main>
      <footer className="site-footer">
        <a className="brand footer-brand" href="#"><span className="brand-mark"><Sparkles size={15} /></span>CareerLens<span className="brand-ai"> AI</span></a>
        <span>Thoughtful career insights, grounded in your experience.</span>
        <span className="footer-note">Not a hiring decision or a guarantee of employment.</span>
      </footer>
    </div>
  )
}

export default App
