export interface MembershipStatusResponseType {
  authType: 'SIGN_IN' | 'SIGN_UP' | null;
}

export interface InternalTokenType {
  accessToken: string;
  refreshToken: string;
}

export interface AuthStatusType {
  isLogin: boolean;
  isSignup: boolean;
}
