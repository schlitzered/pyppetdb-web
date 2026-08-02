// Mirrors the JobParamDefinition schema from the backend openapi spec:
// each job param / environment variable is typed and carries type-specific
// validators (regex for string, min/max for int|float, options for enum).
export type JobParamType = 'string' | 'float' | 'bool' | 'int' | 'enum'

// The definition of a single param / env var as stored on a job definition
// (the backend JobParamDefinition schema). Drives the input widget + validators
// on the job trigger form.
export interface JobParamDefinition {
  type: JobParamType
  regex?: string | null
  min?: number | null
  max?: number | null
  options?: string[] | null
}

// UI row shape: a flat, always-present set of fields the editor binds to.
// Only the fields relevant to `type` are serialized back into the API payload.
export interface JobParamRow {
  key: string
  type: JobParamType
  regex: string
  min: number | null
  max: number | null
  options: string[]
}
