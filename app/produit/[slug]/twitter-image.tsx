// La carte Twitter/X réutilise exactement la même image que Open Graph.
// `runtime` doit être déclaré ici en direct (Next n'accepte pas un ré-export).
export const runtime = "nodejs";
export { default, alt, size, contentType } from "./opengraph-image";
