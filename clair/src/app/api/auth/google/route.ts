import { cookies } from "next/headers";
import { generateCodeVerifier, generateState } from "arctic";
import { googleClient } from "@/lib/auth/oauth";

const COOKIE = { httpOnly: true, sameSite: "lax" as const, path: "/", maxAge: 600, secure: process.env.NODE_ENV === "production" && !process.env.CLAIR_INSECURE_COOKIES };

export async function GET() {
  const google = googleClient();
  if (!google) return new Response("Connexion Google non configurée", { status: 404 });
  const state = generateState();
  const verifier = generateCodeVerifier();
  const store = await cookies();
  store.set("oauth_state", state, COOKIE);
  store.set("oauth_verifier", verifier, COOKIE);
  const url = google.client.createAuthorizationURL(state, verifier, ["openid", "email", "profile"]);
  url.searchParams.set("prompt", "select_account");
  return Response.redirect(url, 302);
}
