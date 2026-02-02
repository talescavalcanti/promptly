import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const url = request.nextUrl.clone();

    // 1. Logic for Authenticated Users
    if (user) {
        try {
            // Use the Database Logic (RPC) to check subscription
            // This calls the 'is_paid_user' function we created in Supabase
            const { data: isPaid, error } = await supabase.rpc('is_paid_user', { user_uuid: user.id });

            // Handle RPC error or null gracefully
            if (!error && isPaid) {
                // STRICT REQUIREMENT: Paid users cannot see Home (/)
                if (url.pathname === "/") {
                    url.pathname = "/dashboard";
                    return NextResponse.redirect(url);
                }
            }
        } catch (e) {
            // Fallback: If RPC fails, do nothing (allow access) to prevent 404/Crash
            console.error("Middleware RPC Error:", e);
        }
    }

    // 2. Logic for Unauthenticated Users
    if (!user) {
        // Protect Dashboard Routes
        if (url.pathname.startsWith("/dashboard") || url.pathname.startsWith("/projects")) {
            const loginUrl = request.nextUrl.clone();
            loginUrl.pathname = "/login";
            return NextResponse.redirect(loginUrl);
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (svg, png, etc.)
         */
        "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
