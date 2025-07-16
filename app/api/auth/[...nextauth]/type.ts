import { DefaultSession } from "next-auth";

// types.ts
export type UserRole = 'Employee' | 'manager' | 'admin'; // Define user roles

declare module 'next-auth' {
  interface User {
    id?: string;
    name?: string;
    email?: string;
    accessToken?: string;
    token?: string;
    image?: string;
    role?: UserRole; // Add the `role` property
  }

  interface Session extends DefaultSession {
    user?: {
      id?: string;
      name?: string;
      email?: string;
      image?: string;
      role?: UserRole; // Add the `role` property
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
    role?: UserRole; // Add the `role` property
  }
}