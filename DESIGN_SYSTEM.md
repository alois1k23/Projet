# DESIGN_SYSTEM — Clair

> Source de vérité du code : `clair/src/app/globals.css` (jetons) et `clair/src/components/ui/index.tsx` (composants).

## 1. Marque

| Élément | Choix |
|---|---|
| Nom (provisoire) | **Clair** — un mot français court, prononçable dans les quatre langues nationales, qui dit le bénéfice. Vérification de marque (IPI, EUIPO) et de domaine **non faite**. |
| Signature | **Votre courrier administratif, enfin clair.** |
| Proposition de valeur | Photographiez un courrier : Clair vous dit ce qu'il signifie, ce que vous devez faire et avant quand. Puis il vous aide à le faire. |
| Positionnement | Le gestionnaire administratif de confiance des ménages suisses, et non « une IA de plus ». |
| Personnalité | Calme, précis, rassurant, jamais infantilisant. On parle comme un ami compétent. |

### Concept visuel : le papier, l'encre et le surligneur
Le courrier administratif est un monde de papier. Clair le transforme en un geste familier : **surligner ce qui compte**. Le jaune surligneur est réservé à ce qui demande une action (une échéance, un point d'attention). Il n'est jamais décoratif.

### Logo et icône
Une feuille blanche sur un carré bleu « encre », dont la ligne centrale est surlignée en jaune. Fichiers : `clair/public/icon.svg` et `clair/src/components/logo.tsx`. Le logotype est « clair » en minuscules, Manrope ExtraBold.

## 2. Couleurs

Tous les couples texte/fond ont été vérifiés (WCAG 2.1 AA, ratio ≥ 4,5:1), et le test automatique axe passe en clair comme en sombre.

| Jeton | Clair | Sombre | Usage |
|---|---|---|---|
| `--bg` | #F4F5F7 | #0D1016 | Fond de page |
| `--surface` | #FFFFFF | #151A22 | Cartes |
| `--surface-2` | #EEF0F4 | #1C222C | Zones secondaires, faits clés |
| `--ink` | #111827 | #EDF0F5 | Texte principal |
| `--ink-2` | #485263 | #B3BBC8 | Texte secondaire |
| `--ink-3` | #5F6877 | #8A93A2 | Méta-informations (≥ 4,9:1) |
| `--primary` | #1F4FD8 | #6F93F5 | Actions, liens, marque |
| `--mark` | #FFD84D | #F5CF45 | Surligneur : ce qui demande une action |
| `--danger` | #C2362F | #F08178 | Retards, suppression |
| `--warning` | #9A6200 | #F0B44C | À vérifier |
| `--success` | #176C41 | #5FCF92 | Fait, enregistré |

Le mode sombre n'est pas une inversion : les teintes sont recalibrées pour le fond sombre. Le thème suit le système par défaut et peut être forcé dans Réglages.

## 3. Typographie

| Rôle | Police | Raison |
|---|---|---|
| Interface et titres | **Manrope** (400–800) | Géométrique mais chaleureuse, chiffres très lisibles, excellente en petite taille sur mobile |
| Références, IBAN | **IBM Plex Mono** | Distinguer 0/O et 1/l dans les numéros à recopier |

Échelle : 12 · 14 · 15 (texte courant) · 17 (résumé) · 20 · 26–30 (titres de page) · 40–60 (accueil public). Chiffres tabulaires pour les montants et les dates.

Conventions suisses : montants « CHF 1’240.50 » (y compris en Romandie), dates « 28 octobre 2026 », espace insécable avant « : ».

## 4. Espacements, rayons, ombres
- Grille de 4 px ; marges de page de 16 px sur mobile, 24 à 40 px sur ordinateur.
- Rayons : 12 px (boutons, champs), 14 px (cartes), 999 px (badges).
- Une seule ombre, très douce, pour les cartes. Les éléments secondaires n'ont qu'une bordure.

## 5. Composants

| Composant | Variantes | Règle d'usage |
|---|---|---|
| `Button` / `ButtonLink` | primary, secondary, ghost, danger · sm, md, lg | Un seul bouton primaire par écran |
| `Card` | — | Contient une liste ou un bloc de sens |
| `Badge` | neutral, primary, mark, danger, warning, success | Toujours avec un libellé, jamais la couleur seule |
| `Notice` | neutral, warning, danger, success, mark | Messages d'état, `role="status"` ou `alert` |
| `Input`, `Textarea`, `Select`, `Label`, `FieldError` | — | Erreur liée par `aria-describedby`, `aria-invalid` |
| `EmptyState` | — | Dit quoi faire ensuite |
| `TaskRow` | ouverte, faite | Case à cocher à soumission automatique |
| `DocumentCard` | — | Expéditeur, date, statut, montant |
| `SideNav` / `BottomNav` | ordinateur / mobile | Bouton « + » central sur mobile, à portée du pouce |
| `ConfirmSubmit` | — | Toute suppression demande une confirmation |

## 6. Mouvement
- Apparition des pages : 260 ms, translation de 6 px. Pas d'animation décorative.
- Étapes de l'analyse affichées pendant l'attente (« Lecture du courrier… »).
- `prefers-reduced-motion` respecté globalement.

## 7. Icônes
Lucide (licence ISC), trait de 2 px. Toujours `aria-hidden` lorsqu'un libellé texte est présent.

## 8. Ton et rédaction
- Phrases courtes, voix active, vocabulaire de l'utilisateur (« échéance », pas « deadline »).
- Les erreurs disent quoi faire : « Format non pris en charge. Utilisez une photo JPEG, PNG ou WebP, ou un PDF. »
- Jamais d'alarmisme ; les risques réels sont nommés clairement (« Le délai d'opposition est de 10 jours seulement »).

## 9. Accessibilité
- Contrastes AA vérifiés automatiquement (axe-core) sur 7 écrans, dans les deux thèmes.
- Lien d'évitement « Aller au contenu », focus visible, navigation au clavier.
- Cibles tactiles d'au moins 40 px, pas de défilement horizontal à 390 px (testé).
