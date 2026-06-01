// @ts-check
import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";

import svelte from "@astrojs/svelte";

import tailwindcss from "@tailwindcss/vite";

/**
 * Wraps `@tailwindcss/vite` so its `generate` transforms skip Svelte's virtual style modules (`x.svelte?svelte&type=style&lang.css`).
 *
 * Those URLs are already produced as fully-compiled CSS by `vite-plugin-svelte`'s own load hook (its `meta.svelte.css` cache). If Tailwind also tries to parse them — which happens in dev whenever a `.svelte` file in `node_modules` has a `<style>` block — it can crash with `Invalid declaration: <identifier>` because it ends up reading the raw `.svelte` source (script + markup + style) as CSS.
 */
function tailwindcssSkipSvelte() {
  const svelteStyleId = /\.svelte\?(?=.*\bsvelte\b)(?=.*type=style)(?=.*\blang\.css\b)/;
  return tailwindcss().map((plugin) => {
    if (!plugin.transform) return plugin;
    const originalTransform = plugin.transform;
    /** @param {string} _code @param {string} id */
    const wrapped = function (_code, id, ...rest) {
      if (svelteStyleId.test(id)) return null;
      const handler =
        typeof originalTransform === "function" ? originalTransform : originalTransform.handler;
      return handler.call(this, _code, id, ...rest);
    };
    return { ...plugin, transform: wrapped };
  });
}

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],
  site: "https://games.kuncat.com",
  vite: {
    plugins: [tailwindcssSkipSvelte()],
    server: {
      fs: {
        // Allow Vite to serve files from the linked `@kuncat/avoidant` source during local development.
        allow: [
          fileURLToPath(new URL(".", import.meta.url)),
          fileURLToPath(new URL("../../avoidant", import.meta.url)),
        ],
      },
    },
    resolve: {
      alias: {
        // `@threlte/extras` ships a barrel index that imports `PerfMonitor.svelte`, which imports `three-perf`, which imports `tweakpane` (UMD-only). Vite's ESM transform serves the raw UMD and the browser then fails `import { Pane }`. We don't use PerfMonitor, so we alias `three-perf` to an empty stub to break the chain entirely.
        "three-perf": fileURLToPath(new URL("./src/stubs/three-perf.js", import.meta.url)),
      },
    },
  },
});
