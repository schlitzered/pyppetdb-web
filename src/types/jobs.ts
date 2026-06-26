export interface Job {
  id: string
  definition_id: string
  status: string
  nodes: string[]
  nodes_filter: string[][]
  params: Record<string, unknown>
  env: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface JobDefinition {
  id: string
  team: string
  executable: string
  params_template: string[]
  params: Record<string, JobParam>
  env: Record<string, JobEnvVar>
}

export interface JobParam {
  type: string
  required: boolean
  default: unknown
  description: string
  options?: string[]
  regex?: string
  min?: number
  max?: number
}

export interface JobEnvVar {
  type: string
  required: boolean
  default: unknown
  description: string
}

export interface NodeJobRun {
  id: string
  job_id: string
  node: string
  status: string
  exit_code: number | null
  created_at: string
  updated_at: string
}
