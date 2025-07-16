import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "next-auth";
import{cookies} from "next/headers"



export const handler: NextAuthOptions = {
  pages: {

    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge:  24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials, _req) {

        console.log(_req.method, "to api login");
        const res = await fetch(`${process.env.NEXT_PUBLIC_Base_URL}/userlogin`, {
          method: "POST",
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
            credentials: 'include',
          headers: { "Content-Type": "application/json" },
        });
        const resp = await res.json();

        if (resp.status == 202) {  
  
              if (resp.Auth.role !== "manager") {
  return null; 
              }

                  res.headers.getSetCookie().forEach(str => {
    const [nameValue, ...options] = str.split(';').map(p => p.trim());
    const [name, value] = nameValue.split('=');
    const maxAgeStr = options.find(o => o.toLowerCase().startsWith('max-age='))?.split('=')[1];
    cookies().set({
      name,
      value,
      maxAge: maxAgeStr !== undefined ? Number(maxAgeStr) : undefined,
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
  });


       const user = {
            id: resp.Auth.sub,
            email:  resp.Auth.email,
            name: resp.Auth.firstname,
            role: resp.Auth.role,
            lastname: resp.Auth.lastname,
          };
          return user as User;
          
        } else if (resp.status === 401) {
          return null; 
        } else {
          return null; 
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
    
        token.user = user;
        token.role = user.role;
      }
      return token;
    },async session({ session, token }) {
      if(session.user){
        
      session.user = token.user as User;

            }      return session;
    },
    async signIn({ user }) {
      if (user) {
        return true; // Allow sign-in if user is valid
      } else {
        return false; // Deny sign-in if user is not valid
      }
    },
  },
};