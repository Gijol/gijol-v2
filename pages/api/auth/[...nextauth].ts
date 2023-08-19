import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { refreshAccessToken } from '../../../lib/utils/auth';

export default NextAuth({
  pages: {
    signIn: '/login',
    error: '/dashboard/error',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: {
        params: { access_type: 'offline', prompt: 'consent' },
      },
    }),
  ],
  secret: process.env.JWT_SECRET,
  session: {
    strategy: 'jwt',
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
      if (Date.now() < token.expires_at! * 900) {
        return token;
      } else {
        return await refreshAccessToken(token);
      }
    },
    async session({ session, token }) {
      session.error = token.error;
      session.user.id_token = token.id_token;
      session.user.refresh_token = token.refresh_token;
      session.user.access_token = token.access_token;
      session.user.expires_at = token.expires_at;
      session.user.isExpired = token.expires_at ? token.expires_at * 1000 < Date.now() : false;
      return session;
    },
  },
});
