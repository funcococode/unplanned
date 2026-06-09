import type { DefaultSession } from 'next-auth';
import type { JWT as DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      username?: string | null;
    };
  }

  interface User {
    id: string;
    username?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    dbId?: string;
    username?: string | null;
  }
}
