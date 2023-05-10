import NextAuth, { TokenSet } from 'next-auth';
import KakaoProvider from 'next-auth/providers/kakao';
import GoogleProvider from 'next-auth/providers/google';

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
      userinfo: {},
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_ID || '',
      clientSecret: process.env.KAKAO_SECRET || '',
    }),
  ],
  secret: process.env.JWT_SECRET || '',
  jwt: {
    maxAge: 10,
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account && account.expires_at) {
        token.id_token = account?.id_token;
        token.access_token = account?.access_token;
        token.refresh_token = account?.refresh_token;
        token.expires_at = account?.expires_at;
        return token;
      } else if (token.expires_at && Date.now() < token.expires_at) {
        return token;
      } else {
        try {
          // https://accounts.google.com/.well-known/openid-configuration
          const response = await fetch('https://oauth2.googleapis.com/token', {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_ID as string,
              client_secret: process.env.GOOGLE_SECRET as string,
              grant_type: 'refresh_token',
              refresh_token: token.refresh_token as string,
            }),
            method: 'POST',
          });

          const tokens: TokenSet = await response.json();

          if (!response.ok) throw Error('Response on refresh token is not valid');
          if (tokens.expires_at) {
            token.id_token = tokens.id_token;
            token.access_token = tokens.access_token;
            token.expires_at = Math.floor(Date.now() / 1000 + tokens.expires_at);
            token.refresh_token = tokens.refresh_token ?? token.refresh_token;
          }
          return token;
        } catch (error) {
          console.error('Error refreshing access token', error);
          return { ...token, error: 'RefreshAccessTokenError' as const };
        }
      }
    },
    async session({ session, token }) {
      session.user.id_token = token.id_token;
      session.user.refresh_token = token.refresh_token;
      session.user.access_token = token.access_token;
      session.user.expires_at = token.expires_at;
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
});
