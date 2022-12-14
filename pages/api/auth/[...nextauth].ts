import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.clientId!,
      clientSecret: process.env.clientSecret!,
    }),
  ],
  secret: process.env.SECRET,
};

export default NextAuth(authOptions);
