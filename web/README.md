This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

The dev server uses **Webpack** (`next dev --webpack`) so it runs on machines where Turbopack’s native bindings fail.

If `@next/swc-darwin-arm64` reports **invalid code signature**, delete `web/node_modules` and run `npm install` again (or clear extended attributes: `xattr -cr node_modules/@next`).

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Shadcn-style UI paths

This app follows the usual shadcn layout: `src/components/ui` for primitives and `src/lib/utils.ts` for `cn()`. Run `npx shadcn@latest init` from `web/` if you want the CLI to manage `components.json`; optional components install with `npx shadcn@latest add button`.

**Dependencies** (after `cd web && npm install`): `motion` (stars), `framer-motion` + `lucide-react` (spatial layout), `clsx` + `tailwind-merge` (class merging).

- **Landing** (`/`) — no starfield, radial chrome only.
- **Starfield shell** — route group `src/app/(nexus)/layout.tsx` wraps `/hub` and `/flow` in `StarsBackground`.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
