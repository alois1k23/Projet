# Vidéos promotionnelles de Clair

Vidéo TikTok / Reels / Shorts en motion design, réalisée avec [Remotion](https://www.remotion.dev/) (React).

| Fichier | Langue | Format |
|---|---|---|
| `out/clair-tiktok-fr.mp4` | Français (version principale, Suisse romande) | 1080 × 1920, 30 i/s, 25 s, H.264, sans son |
| `out/clair-tiktok-de.mp4` | Allemand (Suisse alémanique) | idem |
| `out/clair-tiktok-en.mp4` | Anglais (expatriés) | idem |

## Déroulé (25 s)

| Temps | Scène |
|---|---|
| 0–3 s | Accroche : « Encore un courrier incompréhensible ? », la question est lisible dès la première image |
| 3–7 s | Un courrier en allemand, le téléphone le photographie |
| 7–14 s | L'écran de Clair : résumé tapé en direct, échéance surlignée, « Prochaine étape » |
| 14–18 s | Comprendre. Ne rien oublier. Répondre. |
| 18–21 s | Allemand, italien, anglais → tout est expliqué dans votre langue |
| 21–25 s | Logo, slogan, **« Bientôt disponible sur iOS et Android »**, appel à s'abonner |

Le texte important reste entre y = 200 et y = 1500 px, hors des zones couvertes par l'interface de TikTok (légende, boutons à droite). Les faits montrés sont exacts : résiliation de l'assurance de base reçue au plus tard le 30 novembre (ch.ch). Les courriers sont fictifs (« Krankenkasse Beispiel AG »). Aucun logo officiel Apple ou Google n'est utilisé : leurs badges de téléchargement ne peuvent servir que lorsque l'application est réellement disponible dans leur boutique.

## Publier sur TikTok

1. Importer `clair-tiktok-fr.mp4` depuis le téléphone.
2. **Son** : la vidéo est muette pour que vous choisissiez la musique dans TikTok. Avec un compte professionnel, choisir un titre de la *Commercial Music Library* (les sons « tendance » ne sont pas autorisés pour un usage commercial).
3. **Couverture** : la première image (la question) fonctionne comme couverture.
4. Légende proposée :

**Français**
> Encore un courrier de la caisse-maladie, des impôts ou de l'office des poursuites que vous ne comprenez pas ? Clair vous l'explique en trois phrases, vous dit quoi faire et avant quand. Bientôt sur iOS et Android. Abonnez-vous pour le lancement.
> #suisse #suisseromande #lamal #caissemaladie #impots #administratif #geneve #lausanne #fribourg #neuchatel #startup

**Deutsch**
> Wieder ein Brief von der Krankenkasse, vom Steueramt oder vom Betreibungsamt, den Sie nicht verstehen? Clair erklärt ihn in drei Sätzen und sagt Ihnen, was bis wann zu tun ist. Bald für iOS und Android. Folgen Sie uns für den Start.
> #schweiz #krankenkasse #steuern #betreibung #zürich #bern #basel #luzern #startup

**English**
> Another Swiss letter you can't read? Clair explains it in plain English and tells you what to do and by when. Coming soon to iOS and Android. Follow for the launch.
> #switzerland #expatsinswitzerland #movingtoswitzerland #swisslife #zurich #geneva #lausanne #basel #expatlife

## Modifier et rendre

```bash
npm install
npm run studio          # aperçu interactif dans le navigateur
npm run render          # rend les trois langues dans out/
npm run render -- fr    # une seule langue
```

Les textes sont dans `src/copy.ts`, l'animation dans `src/ClairAd.tsx` (couleurs et typographie de DESIGN_SYSTEM.md). Le rendu termine par une conversion en couleurs standard (`yuv420p`) avec le ffmpeg fourni par Remotion.

**Licence Remotion** : gratuite pour les particuliers et les entreprises de 3 personnes au plus ; au-delà, une licence entreprise payante est nécessaire (voir remotion.pro).
