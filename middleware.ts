import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const pathname = req.nextUrl.pathname;
    
    if (!token) {
      return NextResponse.redirect(new URL("/auth", req.url));
    }

    const entityType = token.entityType as string;
    const contractorStatus = token.contractorStatus as string;

    // Provider routes - only providers allowed
    if (pathname.startsWith("/dashboard")) {
      if (entityType !== "provider") {
        // Contractors should go to their dashboard
        if (entityType === "contractor") {
          return NextResponse.redirect(new URL("/contractor", req.url));
        }
        return NextResponse.redirect(new URL("/auth", req.url));
      }
      return NextResponse.next();
    }

    // Contractor routes - only approved contractors allowed
    if (pathname.startsWith("/contractor")) {
      if (entityType !== "contractor") {
        // Providers should go to their dashboard
        if (entityType === "provider") {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        return NextResponse.redirect(new URL("/auth", req.url));
      }

      // Check if contractor is approved
      if (contractorStatus !== "approved") {
        // Redirect to pending page or auth
        if (contractorStatus === "pending") {
          return NextResponse.redirect(new URL("/auth?pending=true", req.url));
        }
        return NextResponse.redirect(new URL("/auth", req.url));
      }

      return NextResponse.next();
    }

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
        // Allow auth API
        if (req.nextUrl.pathname.startsWith("/api/auth")) {
          return true;
        }
        // Allow upload API for file downloads
        if (req.nextUrl.pathname.startsWith("/api/upload")) {
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
    "/admin/:path*",
    "/profile",
  ],
};
