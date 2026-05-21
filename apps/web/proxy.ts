import { NextRequest, NextResponse } from "next/server";
import { authClient } from "@/lib/authClient";

export async function proxy(request: NextRequest) {
    const session = await authClient.getSession()

    if(!session) {
        return NextResponse.redirect(new URL("/login", request.url));
    } else {
        console.log("User is already authenticated, redirecting to dashboard...");
        if (request.nextUrl.pathname === "/login") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard"], // Specify the routes the middleware applies to
};