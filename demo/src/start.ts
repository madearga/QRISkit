import { createStart } from "@tanstack/react-start";

// Minimal start instance — no server functions, no middleware.
export const startInstance = createStart(() => ({}));
