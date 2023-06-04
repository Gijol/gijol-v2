import NextAuth, { TokenSet } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { refreshAccessToken } from '../../../lib/utils/auth';

export default NextAuth({
  pages: {
    signIn: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_SECRET || '',
      authorization: {
        params: { access_type: 'offline', prompt: 'consent' },
      },
    }),
  ],
  secret: process.env.JWT_SECRET || '',
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60,
    updateAge: 60 * 60,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    maxAge: 60 * 60,
  },
  callbacks: {
    async jwt({ token, account, trigger }) {
      if (account && account.expires_at) {
        token.id_token = account?.id_token;
        token.access_token = account?.access_token;
        token.refresh_token = account?.refresh_token;
        token.expires_at = account?.expires_at;
        return token;
      }
      const nowTime = Math.round(Date.now() / 1000);
      const shouldRefreshTime = (token.expires_at as number) - 10 * 60 - nowTime;
      if (shouldRefreshTime > 0) {
        return token;
      }
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      const isExpired = token.expires_at ? token.expires_at * 1000 < Date.now() : false;
      session.user.id_token = token.id_token;
      session.user.refresh_token = token.refresh_token;
      session.user.access_token = token.access_token;
      session.user.expires_at = token.expires_at;
      session.user.isExpired = isExpired;
      return session;
    },
  },
});
