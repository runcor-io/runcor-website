import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Add custom logic here if needed
    // For example, role-based access control
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        // Allow API routes for device registration (agents need this)
        if (req.nextUrl.pathname.startsWith("/api/devices")) {
          return true;
        }
        if (req.nextUrl.pathname.startsWith("/api/jobs")) {
          return true;
        }
        // Allow role update API
        if (req.nextUrl.pathname === "/api/user/role") {
          return true;
        }
        // Require auth for all other routes
        return token !== null;
      },
    },
    pages: {
      signIn: "/auth",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/contractor/:path*",
    "/api/protected/:path*",
  ],
};
