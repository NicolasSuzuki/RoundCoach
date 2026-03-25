export interface User {
  id: string;
  email: string;
  name: string;
  currentRank?: string | null;
  currentGoal?: string | null;
  mainAgents: string[];
  mainRole?: string | null;
  currentFocus?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}
