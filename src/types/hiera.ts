export interface HieraKey {
  id: string
  team: string
  model: string
  model_type: string
}

export interface HieraLevel {
  id: string
  priority: number
}

export interface HieraLevelData {
  level_id: string
  data_id: string
  key_id: string
  data: unknown
  encrypted: boolean
}

export interface HieraKeyModel {
  id: string
  team: string
  schema: Record<string, unknown>
}

export interface HieraLookupResult {
  key: string
  value: unknown
  level: string
  data_id: string
}
