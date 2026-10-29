import {
  ArrowUpRight, BookOpen, BriefcaseBusiness, CheckCircle2, ChevronRight,
  CircleHelp, FileSearch, Lightbulb, RotateCcw, Sparkles, Target, TrendingUp,
} from 'lucide-react'
import type { AnalysisResult } from '../types'

interface AnalysisDashboardProps {
  analysis: AnalysisResult
  targetRole: string
  onStartOver: () => void
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 43
  return (
    <div className="score-ring" aria-label={`Indicative resume quality score: ${score} out of 100`}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle className="score-track" cx="50" cy="50" r="43" />
        <circle className="score-progress" cx="50" cy="50" r="43" style={{ strokeDasharray: circumference, strokeDashoffset: circumference * (1 - score / 100) }} />
      </svg>
      <span className="score-number">{score}<small>/100</small></span>
    </div>
  )
}

function SectionCard({ icon, title, eyebrow, children, className = '' }: {
  icon: React.ReactNode
  title: string
  eyebrow: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <article className={`analysis-card ${className}`}>
      <div className="analysis-card-heading">
        <span className="card-icon">{icon}</span>
        <div><div className="card-eyebrow">{eyebrow}</div><h3>{title}</h3></div>
      </div>
      {children}
    </article>
  )
}

function SummaryGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="summary-group">
      <h4>{title}</h4>
      <ul>{items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}</ul>
    </div>
  )
}

export function AnalysisDashboard({ analysis, targetRole, onStartOver }: AnalysisDashboardProps) {
  return (
    <>
      <div className="results-header">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR CAREER SNAPSHOT</div>
          <h1>Your experience, <span>in focus.</span></h1>
          <p>Here’s what we found in your resume — and a few directions you could take next.</p>
        </div>
        <button className="outline-button" onClick={onStartOver}><RotateCcw size={15} /> Analyze another resume</button>
      </div>

      <div className="dashboard-grid">
        <SectionCard icon={<FileSearch size={18} />} title="Resume summary" eyebrow="YOUR STORY AT A GLANCE" className="summary-card">
          <div className="summary-columns">
            <SummaryGroup title="Education" items={analysis.summary.education} />
            <SummaryGroup title="Experience" items={analysis.summary.experience} />
            <SummaryGroup title="Projects" items={analysis.summary.projects} />
            <SummaryGroup title="Strengths" items={analysis.summary.strengths} />
          </div>
        </SectionCard>

        <SectionCard icon={<TrendingUp size={18} />} title="Resume quality" eyebrow="AN INDICATIVE SNAPSHOT" className="quality-card">
          <div className="quality-content">
            <ScoreRing score={analysis.qualityScore} />
            <div className="quality-copy"><strong>{analysis.qualityScore >= 75 ? 'A strong foundation' : analysis.qualityScore >= 55 ? 'Room to build on' : 'A starting point'}</strong><p>A directional score based on visible resume structure — not a hiring verdict.</p></div>
          </div>
          <div className="score-breakdown">{analysis.scoreBreakdown.map((item) => (
            <div className="score-row" key={item.label}>
              <span>{item.label}</span><div className="score-bar"><i style={{ width: `${item.score}%` }} /></div><strong>{item.score}</strong>
            </div>
          ))}</div>
        </SectionCard>

        <SectionCard icon={<Sparkles size={18} />} title="Skills analysis" eyebrow="WHAT YOUR RESUME SHOWS" className="skills-card">
          <div className="skill-label">TECHNICAL SKILLS</div>
          {analysis.skills.technical.length ? analysis.skills.technical.map((group) => (
            <div className="skill-group" key={group.category}><h4>{group.category}</h4><div className="skill-chips">{group.skills.map((skill) => <span className="skill-chip" key={skill}>{skill}</span>)}</div></div>
          )) : <p className="muted-copy">No technical skills were explicitly identified. Add tools you have actually used.</p>}
          <div className="skill-label soft-label">SOFT SKILLS</div>
          <div className="skill-chips">{analysis.skills.soft.map((skill) => <span className="skill-chip soft-chip" key={skill}>{skill}</span>)}</div>
        </SectionCard>

        <SectionCard icon={<BriefcaseBusiness size={18} />} title="Job recommendations" eyebrow={targetRole ? `EXPLORE: ${targetRole.toUpperCase()}` : 'POSSIBLE ENTRY-LEVEL PATHS'} className="jobs-card">
          <p className="card-intro">Role directions based on skills mentioned in your resume — not live job listings.</p>
          <div className="recommendation-list">{analysis.jobRecommendations.map((job, index) => (
            <div className="recommendation" key={`${job.title}-${index}`}>
              <div className="match-number">{job.match}<small>%</small></div>
              <div className="recommendation-copy"><strong>{job.title}</strong><p>{job.explanation}</p></div>
              <ArrowUpRight size={16} className="recommendation-arrow" />
            </div>
          ))}</div>
          <p className="disclaimer"><CircleHelp size={13} /> Match estimates are indicative, not a promise of fit or employment.</p>
        </SectionCard>

        <SectionCard icon={<Target size={18} />} title="Missing skills" eyebrow={targetRole ? `NOT CLEARLY EVIDENCED FOR ${targetRole.toUpperCase()}` : 'GROWTH AREAS TO CONSIDER'} className="missing-card">
          <p className="card-intro">These may be useful for your direction, but weren’t clearly evidenced in the text provided. They may still be skills you have.</p>
          <div className="missing-list">
            {analysis.missingSkills.length ? analysis.missingSkills.map((skill) => <span className="missing-chip" key={skill}><span />{skill}</span>) : <div className="positive-note"><CheckCircle2 size={17} /> No specific gaps identified from this text.</div>}
          </div>
        </SectionCard>

        <SectionCard icon={<BookOpen size={18} />} title="Learning suggestions" eyebrow="SMALL STEPS, REAL MOMENTUM" className="learning-card">
          {analysis.learningSuggestions.length ? (
            <div className="learning-list">{analysis.learningSuggestions.map((item, index) => (
              <div className="learning-item" key={`${item.topic}-${index}`}>
                <span className="learning-number">0{index + 1}</span>
                <div><strong>{item.topic}</strong><p><BookOpen size={13} /> {item.resource}</p><p><Lightbulb size={13} /> {item.project}</p></div>
                <ChevronRight size={16} className="learning-chevron" />
              </div>
            ))}</div>
          ) : <p className="muted-copy">Keep building on your existing experience with practical, role-relevant projects.</p>}
        </SectionCard>

        <SectionCard icon={<Lightbulb size={18} />} title="Resume improvements" eyebrow="SPECIFIC, ACTIONABLE FEEDBACK" className="improvements-card">
          {analysis.improvements.map((item, index) => (
            <div className="improvement-item" key={`improvement-${index}`}>
              <p className="improvement-feedback">{item.feedback}</p>
              <div className="example-row"><span className="example-label before-label">BEFORE</span><p>{item.before}</p></div>
              <div className="example-row"><span className="example-label after-label">TRY INSTEAD</span><p>{item.after}</p></div>
            </div>
          ))}
          <p className="authenticity-note"><CheckCircle2 size={14} /> Keep every detail accurate. Only add outcomes you can personally verify.</p>
        </SectionCard>
      </div>
      <button className="bottom-reset" onClick={onStartOver}><RotateCcw size={15} /> Start over with another resume</button>
    </>
  )
}
