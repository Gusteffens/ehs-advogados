import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
    // Bloqueia /sign-up — cadastro é apenas via Clerk Dashboard
    if (req.nextUrl.pathname.startsWith('/sign-up')) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    if (isProtectedRoute(req)) {
        await auth.protect({
            unauthenticatedUrl: new URL('/sign-in', req.url).toString(),
        });

        const sessionClaims = (await auth()).sessionClaims;
        const role = (sessionClaims?.metadata as any)?.role;

        if (role !== 'admin') {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }
}, {
    signInUrl: '/sign-in',
    signUpUrl: '/sign-up',
});

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};