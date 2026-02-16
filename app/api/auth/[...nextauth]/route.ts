import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/runcor";

// Helper to get DB connection
async function getDb() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client.db("runcor");
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
        action: { label: "Action", type: "text" }, // "login" or "register"
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username and password required");
        }

        const db = await getDb();
        const users = db.collection("users");

        const { username, password, role, action } = credentials;
        const normalizedUsername = username.toLowerCase().trim();

        if (action === "register") {
          // Check if user already exists
          const existingUser = await users.findOne({ username: normalizedUsername });
          if (existingUser) {
            throw new Error("Username already exists");
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(password, 10);

          // Create user
          const newUser = {
            username: normalizedUsername,
            password: hashedPassword,
            role: role || "owner", // "owner" (device owner) or "contractor"
            createdAt: new Date().toISOString(),
          };

          await users.insertOne(newUser);

          return {
            id: normalizedUsername,
            username: normalizedUsername,
            role: newUser.role,
          };
        }

        // Login
        const user = await users.findOne({ username: normalizedUsername });
        if (!user) {
          throw new Error("Invalid username or password");
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          throw new Error("Invalid username or password");
        }

        return {
          id: normalizedUsername,
          username: normalizedUsername,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" 
        ? `__Secure-next-auth.session-token` 
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user = {
          ...session.user,
          username: token.username as string,
          role: token.role as string,
        };
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
