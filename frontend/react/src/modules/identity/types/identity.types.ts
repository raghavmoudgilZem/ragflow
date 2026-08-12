// export interface LoginFormData {
//   email: string;
//   password: string;
//   rememberMe: boolean;
// }

// export interface LoginFormErrors {
//   email?: string;
//   password?: string;
// }

// export interface UserProfile {
//   email: string;
//   id?: string;
//   name?: string;
// }

// export interface AuthState {
//   isLoading: boolean;
//   user: UserProfile | null;
//   error: string | null;
// }


export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  name?: string; // ✅ ADDED: Keeps avatar fallback code happy
  avatarUrl?: string;
  currentTenantId?: string;
}

export interface UserSession {
  id: string;
  role: string;
  email?: string;
  nickname?: string;
  name?: string;
}

export interface LoginFormData {
  email: string;
  password?: string;
  nickname?: string;
  rememberMe: boolean;
}

export interface AuthState {
  isLoading: boolean;
  user: UserProfile | null;
  error: string | null;
}