export interface SkillGroup {
  category: string
  skills: string[]
}

export interface JobRecommendation {
  title: string
  match: number
  explanation: string
}

export interface LearningSuggestion {
  topic: string
  resource: string
  project: string
}

export interface ResumeImprovement {
  feedback: string
  before: string
  after: string
}

export interface AnalysisResult {
  summary: {
    education: string[]
    experience: string[]
    projects: string[]
    strengths: string[]
  }
  skills: {
    technical: SkillGroup[]
    soft: string[]
  }
  jobRecommendations: JobRecommendation[]
  missingSkills: string[]
  learningSuggestions: LearningSuggestion[]
  improvements: ResumeImprovement[]
  qualityScore: number
  scoreBreakdown: { label: string; score: number }[]
}
