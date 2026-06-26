export interface UserData {
  id: string
  admin: boolean | number
  permissions: string[]
}

export interface LoginFormData {
  user: string
  password: string
}

export interface OAuthProvider {
  name: string
  url: string
}
