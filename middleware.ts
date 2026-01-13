import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicPage = createRouteMatcher(["/login"]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicPage(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
