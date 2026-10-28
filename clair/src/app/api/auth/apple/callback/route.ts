import { cookies } from "next/headers";
import { decodeIdToken } from "arctic";
import { createSession } from "@/lib/auth/session";
import { appleClient, profileFromIdToken, signInWithOAuth } from "@/lib/auth/oauth";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  const base = env().CLAIR_APP_URL;
  const fail = () => Response.redirect(`${base}/connexion?erreur=apple`, 303);
  const apple = appleClient();
  if (!apple) return fail();
  const form = await request.formData();
  const store = await cookies();
  const state = store.get("apple_state")?.value;
  store.delete("apple_state");
  const code = form.get("code");
  if (typeof code !== "string" || !state || form.get("state") !== state) return fail();
  try {
    const tokens = await apple.client.validateAuthorizationCode(code);
    const user = form.get("user");
    const profile = profileFromIdToken("apple", decodeIdToken(tokens.idToken()) as Record<string, unknown>, apple.clientId, Date.now(), typeof user === "string" ? user : null);
    const { userId, created } = await signInWithOAuth(profile);
    await createSession(userId);
    return Response.redirect(`${base}/accueil${created ? "?bienvenue=1" : ""}`, 303);
  } catch (error) {
    console.error("Connexion Apple impossible", error);
    return fail();
  }
}
