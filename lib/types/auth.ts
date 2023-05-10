export interface AuthTypeCheckResponseType {
  authType: 'login' | 'signup' | null;
}

export interface InternalTokenType {
  accessToken: string;
  refreshToken: string;
}

export interface AuthStatusType {
  isLogin: boolean;
  isSignup: boolean;
}
