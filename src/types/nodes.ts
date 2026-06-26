export interface Node {
  node: string
  team: string
  environment: string
  disabled: boolean
  status_unchanged: number
  status_changed: number
  status_failed: number
  status_unreported: number
  status_outdated: number
  report_status: string
  facts_inject: Record<string, unknown>
  facts: Record<string, unknown>
  change_last: string | null
  change_catalog: string | null
  change_facts: string | null
  change_report: string | null
  connected: boolean
  via: string
}

export interface NodeGroup {
  id: string
  nodes: string[]
  regex: string
}

export interface NodeReport {
  id: string
  node: string
  environment: string
  status: string
  noop: boolean
  timestamp: string
}
