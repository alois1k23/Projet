import { cookies } from "next/headers";
import { generateState } from "arctic";
import { appleClient } from "@/lib/auth/oauth";

export async function GET() {
  const apple = appleClient();
  if (!apple) return new Response("Connexion Apple non configurée", { status: 404 });
  const state = generateState();
  // Apple renvoie la réponse par un POST depuis son domaine : le cookie d'état doit être SameSite=None (donc Secure).
  (await cookies()).set("apple_state", state, { httpOnly: true, sameSite: "none", secure: true, path: "/api/auth/apple", maxAge: 600 });
  const url = apple.client.createAuthorizationURL(state, ["name", "email"]);
  url.searchParams.set("response_mode", "form_post");
  return Response.redirect(url, 302);
}
