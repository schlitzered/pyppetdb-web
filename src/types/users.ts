export interface User {
  id: string
  admin: boolean
  teams: string[]
}

export interface UserCredential {
  id: string
  user_id: string
  type: string
}
