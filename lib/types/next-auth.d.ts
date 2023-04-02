import { DefaultSession } from 'next-auth';

declare module 'next-auth/jwt' {
  interface JWT {
    idToken: string;
  }
}

declare module 'next-auth' {
  interface Session {
    user: {
      idToken: string;
    } & DefaultSession['user'];
  }
}
