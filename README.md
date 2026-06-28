# Tchokos — Frontend (Next.js)

Vitrine e-commerce **mobile-first** de la plateforme Tchokos (chaussures &
vêtements, Douala — Cameroun). Consomme l'API du backend Django/Wagtail
(dépôt séparé `tchokos-backend`).

Inspiration UX : Jumia / Glotelho / Alibaba — moderne, rapide, orienté vente.

## Stack
- **Next.js 16** (App Router, Server Components) + **React 19**
- **TypeScript** + **Tailwind CSS v4**
- Polices **Inter** (texte) + **Poppins** (titres) via `next/font`
- Images optimisées (`next/image`)

## Fonctionnalités
- Page d'accueil : hero, catégories, coups de cœur, promos, bannière revendeurs
- Boutique avec filtres par catégorie (`/boutique?categorie=...`)
- Pages catégorie et fiche produit (galerie + SEO dynamique)
- **Commande via WhatsApp** : le formulaire poste la commande au backend qui
  renvoie un lien `wa.me` pré-rempli (référence, articles, total)
- Formulaire de contact (envoi email via Brevo côté backend)
- Bouton WhatsApp flottant, design responsive, FR par défaut

## Démarrage

```bash
npm install
cp .env.example .env.local        # NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev                       # http://localhost:3000
```

> ⚠️ Le backend (`tchokos-backend`) doit tourner et `NEXT_PUBLIC_API_URL`
> pointer dessus. En local par défaut : `http://localhost:8000`.

## Build production

```bash
npm run build
npm run start
```

## Configuration

| Variable | Rôle | Défaut |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL du backend Django | `http://localhost:8000` |

Le contenu (produits, catégories, numéro WhatsApp, réseaux sociaux, adresse)
provient entièrement de l'API — rien n'est codé en dur. L'équipe Tchokos met à
jour via le back-office Django (`/gestion/`) et Wagtail (`/cms/`).

## Structure

```
app/
  page.tsx                 Accueil
  boutique/                Tous les produits + filtres
  categorie/[slug]/        Page catégorie
  produit/[slug]/          Fiche produit + commande
  a-propos/  contact/
components/                Header, Footer, Hero, ProductCard, OrderForm…
lib/                       api.ts (client), types.ts, format.ts
```
