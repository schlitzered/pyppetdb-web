export interface UserData {
  id: string
  admin: boolean | number
  permissions: string[]
}

export interface LoginFormData {
  user: string
  password: string
}

// OauthProviderGet in the spec exposes only `id`; the login URL is derived
// from it (/oauth/authenticate/oauth/{id}/login).
export interface OAuthProvider {
  id: string
}
