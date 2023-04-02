import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_SECRET || '',
    }),
  ],
  secret: process.env.JWT_SECRET || '',
  callbacks: {
    async jwt({ token, user, account }) {
      if (account) {
        token.idToken = account.id_token || '';
      }
      return token;
    },
    async session({ session, token, user }) {
      session.user.idToken = token.idToken;
      return session;
    },
  },
});
