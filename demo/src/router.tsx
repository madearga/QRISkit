import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const router = createRouter({ routeTree });

// TanStack Start's router-plugin expects a `getRouter` factory (imported from this
// module) to wire the generated client/ssr entries.
export const getRouter = () => router;

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
