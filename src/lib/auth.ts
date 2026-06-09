import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? '';

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, account, trigger }) {
      // Run on: first sign-in (account set), missing dbId, or explicit session update
      if ((account || !token.dbId || trigger === 'update') && token.email) {
        try {
          const { prisma } = await import('./prisma');
          // Select only stable columns that exist in every migration state
          const user = await prisma.user.upsert({
            where: { email: token.email },
            create: {
              email:     token.email,
              name:      token.name    ?? 'Traveler',
              image:     token.picture ?? null,
              languages: [],
            },
            update: {
              name:  token.name  ?? undefined,
              image: token.picture ?? undefined,
            },
            select: { id: true, username: true },
          });
          token.dbId     = user.id;
          token.username = user.username ?? null;
        } catch (err) {
          // Log but don't crash — token.dbId may already be set from a prior callback
          console.error('[auth] jwt upsert failed:', err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Proxy dbId (Postgres UUID) as session.user.id, not Google sub
      session.user.id       = token.dbId ? token.dbId as string : '';
      session.user.username = (token.username as string | null) ?? null;
      return session;
    },
  },
});
