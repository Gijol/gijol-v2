import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import KakaoProvider from 'next-auth/providers/kakao';

export default NextAuth({
  pages: {
    signIn: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_SECRET || '',
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_ID || '',
      clientSecret: process.env.KAKAO_SECRET || '',
    }),
  ],
  secret: process.env.JWT_SECRET || '',
  jwt: {},
  callbacks: {
    jwt: async function ({ token, user, account }) {
      if (account) {
        token.idToken = account.id_token || '';
      }
      return token;
    },
    session: async function ({ session, token, user }) {
      session.user.idToken = token.idToken;
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
});
