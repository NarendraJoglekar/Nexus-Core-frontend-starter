export type CompanySubmission = {
  id: string
  name: string
  sector: string
  arr: number
  runway: number
  team: string
  claims: string
}

export type NexusReport = {
  submissionId: string
  summary: string[]
  investorEvidence: string[]
  createdAt: string
}
