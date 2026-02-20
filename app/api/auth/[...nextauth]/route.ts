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
        entityType: { label: "Entity Type", type: "text" }, // "provider" or "contractor"
        action: { label: "Action", type: "text" }, // "login" or "register"
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username and password required");
        }

        const { username, password, entityType, action } = credentials;
        const normalizedUsername = username.toLowerCase().trim();

        // Admin login - simple check
        if (normalizedUsername === "admin" && password === "runcorp5225") {
          return {
            id: "admin",
            username: "admin",
            entityType: "admin",
            walletBalance: 0,
          };
        }

        const db = await getDb();
        const users = db.collection("users");

        if (action === "register") {
          // Check if user already exists
          const existingUser = await users.findOne({ username: normalizedUsername });
          if (existingUser) {
            throw new Error("Username already exists");
          }

          // Validate entityType
          if (!entityType || !["provider", "contractor"].includes(entityType)) {
            throw new Error("Invalid entity type");
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(password, 10);

          // Create user
          const newUser: any = {
            username: normalizedUsername,
            password: hashedPassword,
            entityType: entityType, // "provider" or "contractor"
            walletBalance: 1000, // Free tokens on signup
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Contractors need approval
          if (entityType === "contractor") {
            newUser.contractorStatus = "pending"; // pending | approved | rejected
          }

          await users.insertOne(newUser);

          // Don't auto-login contractors - they need approval
          if (entityType === "contractor") {
            throw new Error("ACCOUNT_PENDING_APPROVAL");
          }

          return {
            id: normalizedUsername,
            username: normalizedUsername,
            entityType: newUser.entityType,
            walletBalance: newUser.walletBalance,
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

        // Check if contractor is approved
        if (user.entityType === "contractor" && user.contractorStatus !== "approved") {
          if (user.contractorStatus === "pending") {
            throw new Error("ACCOUNT_PENDING_APPROVAL");
          }
          if (user.contractorStatus === "rejected") {
            throw new Error("ACCOUNT_REJECTED");
          }
        }

        return {
          id: normalizedUsername,
          username: normalizedUsername,
          entityType: user.entityType,
          contractorStatus: user.contractorStatus,
          walletBalance: user.walletBalance || 0,
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
        token.entityType = user.entityType;
        token.contractorStatus = user.contractorStatus;
        token.walletBalance = user.walletBalance;
        token.isAdmin = user.entityType === "admin";
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user = {
          ...session.user,
          username: token.username as string,
          entityType: token.entityType as string,
          contractorStatus: token.contractorStatus as string,
          walletBalance: token.walletBalance as number,
          isAdmin: token.isAdmin as boolean,
        };
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
