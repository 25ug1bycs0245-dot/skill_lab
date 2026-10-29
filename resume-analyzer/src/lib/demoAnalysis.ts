import type { AnalysisResult, SkillGroup } from '../types'

const skillCategories: Record<string, string[]> = {
  'Programming languages': ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'SQL', 'HTML', 'CSS'],
  'Frameworks & tools': ['React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Git', 'Docker', 'AWS', 'Figma'],
  'Data & analytics': ['Excel', 'Power BI', 'Tableau', 'Pandas', 'NumPy', 'Machine Learning', 'PostgreSQL', 'MongoDB'],
}

const softSkills = ['communication', 'leadership', 'collaboration', 'teamwork', 'problem-solving', 'problem solving', 'mentoring', 'adaptability', 'organization', 'time management']

const sectionAliases: Record<string, string[]> = {
  education: [
    'education and qualifications', 'education & qualifications',
    'educational qualifications', 'academic qualifications', 'education and training',
    'education & training', 'educational background', 'educational details',
    'academic background', 'academic history', 'academic details',
    'education details', 'education',
  ],
  experience: [
    'professional experience', 'work experience', 'internship experience',
    'employment history', 'work history', 'relevant experience', 'internships',
    'experience',
  ],
  projects: [
    'projects undertaken', 'projects and research', 'academic projects',
    'personal projects', 'selected projects', 'major projects', 'technical projects',
    'university projects', 'relevant projects', 'project experience', 'project work',
    'key projects', 'projects',
  ],
  other: [
    'technical skills', 'core competencies', 'certifications', 'achievements',
    'publications', 'volunteer experience', 'professional summary', 'career objective',
    'summary', 'profile', 'objective', 'skills', 'certificates', 'awards',
    'languages', 'interests', 'references',
  ],
}

const sectionHeadings = Object.entries(sectionAliases)
  .flatMap(([section, aliases]) => aliases.map((alias) => ({ section, alias })))
  .sort((left, right) => right.alias.length - left.alias.length)
const aliasToSection = new Map(sectionHeadings.map(({ section, alias }) => [alias.toLowerCase(), section]))
const sectionHeadingPattern = new RegExp(
  `(\\s*|[|:;•·]\\s*|\\s+)(${sectionHeadings
    .map(({ alias }) => alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+'))
    .join('|')})(?=\\s|[:|—–-]|$)`,
  'gi',
)

function getMatches(text: string, skills: string[]): string[] {
  return skills.filter((skill) => new RegExp(`(^|[^a-z0-9])${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`, 'i').test(text))
}

function findSectionHeading(line: string, fromIndex: number) {
  sectionHeadingPattern.lastIndex = fromIndex
  let match = sectionHeadingPattern.exec(line)
  while (match) {
    const prefix = match[1]
    const matchedAlias = match[2]
    const aliasStart = match.index + prefix.length
    const startsLine = line.slice(0, aliasStart).trim().length === 0
    const isUppercaseHeading = matchedAlias === matchedAlias.toUpperCase()
    const followsSeparator = /^[|:;•·]/.test(prefix.trimStart())
    if (startsLine || isUppercaseHeading || followsSeparator) {
      return {
        section: aliasToSection.get(matchedAlias.toLowerCase()) ?? 'other',
        start: aliasStart,
        end: match.index + match[0].length,
      }
    }
    match = sectionHeadingPattern.exec(line)
  }
  return null
}

function getResumeSections(text: string): Record<string, string[]> {
  const sections: Record<string, string[]> = { education: [], experience: [], projects: [] }
  let activeSection: string | null = null
  const cleanSectionLine = (line: string) => line.replace(/^[\s|:;•·]+|[\s|:;•·]+$/g, '')

  for (const line of text.split(/\r\n?|\n|\f/)) {
    let remainingStart = 0
    let foundHeading = false
    while (remainingStart < line.length) {
      const heading = findSectionHeading(line, remainingStart)
      if (!heading) break

      const contentBeforeHeading = cleanSectionLine(line.slice(remainingStart, heading.start))
      if (contentBeforeHeading && activeSection && activeSection in sections) {
        sections[activeSection].push(contentBeforeHeading)
      }
      activeSection = heading.section
      remainingStart = heading.end
      foundHeading = true
    }

    const content = cleanSectionLine(line.slice(remainingStart))
    if (content && activeSection && activeSection in sections) {
      sections[activeSection].push(content)
    } else if (!foundHeading && !content) {
      activeSection = null
    }
  }

  return sections
}

function sectionLines(sections: Record<string, string[]>, section: string): string[] {
  return sections[section].filter(Boolean).slice(0, 5)
}

export function createDemoAnalysis(resume: string, targetRole: string): AnalysisResult {
  const text = resume.slice(0, 50000)
  const resumeSections = getResumeSections(text)
  const technical: SkillGroup[] = Object.entries(skillCategories).flatMap(([category, skills]) => {
    const found = getMatches(text, skills)
    return found.length ? [{ category, skills: found }] : []
  })
  const soft = getMatches(text, softSkills).map((skill) => skill.replace(/\b\w/g, (letter) => letter.toUpperCase()))
  const allSkills = [...technical.flatMap((group) => group.skills), ...soft]
  const target = targetRole.toLowerCase()
  const roleOptions = [
    { title: 'Frontend Developer', matching: ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Angular', 'Vue'] },
    { title: 'Data Analyst', matching: ['SQL', 'Python', 'Excel', 'Power BI', 'Tableau', 'Pandas'] },
    { title: 'Backend Developer', matching: ['Node.js', 'Express', 'Python', 'Java', 'PostgreSQL', 'MongoDB', 'Docker'] },
    { title: 'Software Developer', matching: ['Java', 'Python', 'C++', 'JavaScript', 'Git', 'SQL'] },
  ]
  const chosenRoles = target
    ? roleOptions.filter((role) => role.title.toLowerCase().includes(target) || target.includes(role.title.toLowerCase().split(' ')[0])).slice(0, 1)
    : roleOptions.slice(0, 3)
  const recommendations = (chosenRoles.length ? chosenRoles : roleOptions.slice(0, 3)).map((role) => {
    const matching = role.matching.filter((skill) => allSkills.some((found) => found.toLowerCase() === skill.toLowerCase()))
    const match = Math.min(93, Math.max(34, 38 + Math.round((matching.length / role.matching.length) * 55)))
    return {
      title: targetRole || role.title,
      match,
      explanation: matching.length
        ? `Your resume mentions ${matching.slice(0, 4).join(', ')} — relevant signals for this path.`
        : 'This is a possible entry-level direction to explore; your resume has limited role-specific evidence so far.',
    }
  })
  const education = sectionLines(resumeSections, 'education')
  const experience = sectionLines(resumeSections, 'experience')
  const projects = sectionLines(resumeSections, 'projects')
  const hasMetrics = /\b\d+\s*(%|percent|users|customers|hours|x\b|k\b|m\b)/i.test(text)
  const hasBullets = /(^|\n)\s*[-•*]/.test(text)
  const hasDates = /\b(20\d{2}|19\d{2})\b/.test(text)
  const sections = [education.length > 0, experience.length > 0, projects.length > 0, technical.length > 0]
  const score = Math.round(42 + sections.filter(Boolean).length * 9 + (hasMetrics ? 8 : 0) + (hasBullets ? 6 : 0) + (hasDates ? 8 : 0))
  const gapOptions = target.toLowerCase().includes('data')
    ? ['SQL', 'data visualization', 'statistical analysis']
    : target.toLowerCase().includes('front')
      ? ['responsive design', 'accessibility', 'testing']
      : target.toLowerCase().includes('back')
        ? ['API design', 'database fundamentals', 'testing']
        : ['role-specific tools', 'measurable project outcomes', 'relevant practical experience']
  const missingSkills = gapOptions.filter((skill) => !new RegExp(`\\b${skill}\\b`, 'i').test(text))
  const exampleLine = text.split(/\n+/).map((line) => line.trim()).find((line) => line.length > 12)
  const improvements: AnalysisResult['improvements'] = []
  if (!hasMetrics) improvements.push({
    feedback: 'Add measurable context where you can verify it. Numbers help readers understand the scale of your work.',
    before: exampleLine ? `“${exampleLine.slice(0, 110)}”` : 'No example sentence found in the provided text.',
    after: 'Keep the original facts, then add scope or results only if you can verify them.',
  })
  if (!hasBullets) improvements.push({
    feedback: 'Use concise bullet points to make responsibilities and outcomes easier to scan.',
    before: 'No bulleted responsibilities were clearly identified.',
    after: 'Start with an action verb, describe your contribution, and add verified outcomes if available.',
  })
  improvements.push({
    feedback: 'Tailor the skills section to the role you want, and keep each skill tied to evidence in your projects or experience.',
    before: technical.length ? `Skills found: ${allSkills.slice(0, 4).join(', ')}` : 'No technical skills section was clearly identified.',
    after: `List tools you have actually used${allSkills.length ? `, such as ${allSkills.slice(0, 4).join(', ')}` : ''}.`,
  })

  const strengths = [
    ...(technical.length ? [`Demonstrates ${allSkills.slice(0, 3).join(', ')} in the provided content`] : []),
    ...(projects.length ? ['Includes a dedicated projects section'] : []),
    ...(hasMetrics ? ['Includes measurable details'] : []),
    ...(hasDates ? ['Provides dated experience or education'] : []),
  ]

  return {
    summary: {
      education: education.length ? education : ['No clearly labeled education section found in the provided text.'],
      experience: experience.length ? experience : ['No clearly labeled experience section found in the provided text.'],
      projects: projects.length ? projects : ['No clearly labeled projects section found in the provided text.'],
      strengths: strengths.length ? strengths : ['Add clear section headings to make your experience easier to find.'],
    },
    skills: {
      technical,
      soft: soft.length ? soft : ['No soft skills explicitly identified in the provided text.'],
    },
    jobRecommendations: recommendations,
    missingSkills,
    learningSuggestions: missingSkills.slice(0, 3).map((topic) => ({
      topic,
      resource: topic.toLowerCase().includes('sql') ? 'SQLBolt interactive lessons' : `${topic} fundamentals and documentation`,
      project: `Build a small, portfolio-ready project that demonstrates ${topic} in a context related to ${targetRole || 'your preferred role'}.`,
    })),
    improvements,
    qualityScore: Math.min(score, 92),
    scoreBreakdown: [
      { label: 'Section clarity', score: Math.round(sections.filter(Boolean).length / sections.length * 100) },
      { label: 'Skills evidence', score: Math.min(100, 25 + allSkills.length * 12) },
      { label: 'Measurable detail', score: hasMetrics ? 90 : 42 },
      { label: 'Readable structure', score: hasBullets ? 88 : 55 },
    ],
  }
}

export function isAnalysisResult(value: unknown): value is AnalysisResult {
  if (!value || typeof value !== 'object') return false
  const result = value as Partial<AnalysisResult>
  const strings = (items: unknown): items is string[] => Array.isArray(items) && items.every((item) => typeof item === 'string')
  const scoredItems = (items: unknown): boolean => Array.isArray(items) && items.every((item) =>
    item && typeof item.label === 'string' && Number.isInteger(item.score) && item.score >= 0 && item.score <= 100)
  return Number.isInteger(result.qualityScore) && result.qualityScore! >= 0 && result.qualityScore! <= 100
    && typeof result.summary === 'object' && result.summary !== null
    && strings(result.summary.education)
    && strings(result.summary.experience)
    && strings(result.summary.projects)
    && strings(result.summary.strengths)
    && typeof result.skills === 'object' && result.skills !== null
    && Array.isArray(result.skills.technical)
    && result.skills.technical.every((group) => group && typeof group.category === 'string' && strings(group.skills))
    && strings(result.skills.soft)
    && Array.isArray(result.jobRecommendations)
    && result.jobRecommendations.every((job) => job && typeof job.title === 'string'
      && typeof job.explanation === 'string' && Number.isFinite(job.match) && job.match >= 0 && job.match <= 100)
    && Array.isArray(result.missingSkills)
    && strings(result.missingSkills)
    && Array.isArray(result.learningSuggestions)
    && result.learningSuggestions.every((item) => item && typeof item.topic === 'string'
      && typeof item.resource === 'string' && typeof item.project === 'string')
    && Array.isArray(result.improvements)
    && result.improvements.every((item) => item && typeof item.feedback === 'string'
      && typeof item.before === 'string' && typeof item.after === 'string')
    && scoredItems(result.scoreBreakdown)
}
