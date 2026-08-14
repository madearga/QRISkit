import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import styles from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { title: "qriskit demo" },
      { name: "description", content: "QRIS parse, validate & convert playground powered by qriskit" },
    ],
    links: [{ rel: "stylesheet", href: styles }],
  }),
  component: RootComponent,
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <RootDocument>
      <main className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <Outlet />
        </div>
      </main>
    </RootDocument>
  );
}
