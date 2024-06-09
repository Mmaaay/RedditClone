import { NextAuthOptions, getServerSession } from "next-auth";
import { db } from "./db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        Email: { label: "Email", type: "email" },
        Password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await db.user.findFirst({
          where: {
            email: credentials?.Email,
          },
        });
        if (
          user &&
          //@ts-expect-error
          bcrypt.compareSync(credentials?.Password, user.hashedPassword)
        ) {
          return user;
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.username = token.username;
      }
      return session;
    },
    async jwt({ token, user }) {
      const dbUser = await db.user.findFirst({
        where: { email: token?.email },
      });
      if (!dbUser) {
        token.id = user!.id;
        return token;
      }
      if (!dbUser.username) {
        await db.user.update({
          where: { id: dbUser.id },
          data: { username: nanoid(10) },
        });
      }
      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        image: dbUser.image,
        username: dbUser.username,
      };
    },

    async redirect({ url, baseUrl }) {
      // Allow relative URLs and URLs on the same base URL
      if (url.startsWith(baseUrl) || url.startsWith("/")) {
        return url.startsWith(baseUrl) ? url : `${baseUrl}${url}`;
      }
      return baseUrl; // Default to baseUrl if the URL is not allowed
    },
  },
};

export const getAuthSession = () => getServerSession(authOptions);
