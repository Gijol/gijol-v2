import { DefaultSession } from 'next-auth';
import { AuthStatusType } from './auth';

declare module 'next-auth/jwt' {
  interface JWT {
    id_token?: string | null | undefined;
    access_token?: string | undefined;
    refresh_token?: string | undefined;
    expires_at?: number;
  }
}

declare module 'next-auth' {
  interface User extends AuthStatusType {}
  interface Session {
    user: {
      id_token?: string | null | undefined;
      access_token?: string | undefined;
      refresh_token?: string | undefined;
      expires_at?: number;
    } & DefaultSession['user'];
  }
}
