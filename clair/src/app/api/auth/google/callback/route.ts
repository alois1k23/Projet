import { cookies } from "next/headers";
import { decodeIdToken } from "arctic";
import { createSession } from "@/lib/auth/session";
import { googleClient, profileFromIdToken, signInWithOAuth } from "@/lib/auth/oauth";
import { env } from "@/lib/env";

export async function GET(request: Request) {
  const base = env().CLAIR_APP_URL;
  const fail = () => Response.redirect(`${base}/connexion?erreur=google`, 303);
  const google = googleClient();
  if (!google) return fail();
  const params = new URL(request.url).searchParams;
  const store = await cookies();
  const state = store.get("oauth_state")?.value;
  const verifier = store.get("oauth_verifier")?.value;
  store.delete("oauth_state");
  store.delete("oauth_verifier");
  const code = params.get("code");
  if (!code || !state || !verifier || params.get("state") !== state) return fail();
  try {
    const tokens = await google.client.validateAuthorizationCode(code, verifier);
    const profile = profileFromIdToken("google", decodeIdToken(tokens.idToken()) as Record<string, unknown>, google.clientId);
    const { userId, created } = await signInWithOAuth(profile);
    await createSession(userId);
    return Response.redirect(`${base}/accueil${created ? "?bienvenue=1" : ""}`, 303);
  } catch (error) {
    console.error("Connexion Google impossible", error);
    return fail();
  }
}
