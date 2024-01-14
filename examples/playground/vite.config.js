import { defineConfig } from "vite";
import chibivue from "../../packages/@extensions/vite-plugin-chibivue";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));

export default defineConfig({
  base: dirname,
  resolve: {
    alias: {
      chibivue: `${process.cwd()}/../../packages`,
    },
  },
  plugins: [chibivue()],
});
