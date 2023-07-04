// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import Unfonts from "unplugin-fonts/vite";
import Icons from "unplugin-icons/vite";

export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      target: "es2020",
    },
  },
  esbuild: {
    // https://github.com/vitejs/vite/issues/8644#issuecomment-1159308803
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-macros", "babel-plugin-styled-components"],
      },
    }),
    Icons({ compiler: "jsx", jsx: "react" }),
    Unfonts({
      google: {
        preconnect: true,
        families: [
          {
            name: "Inter",
          },
        ],
      },
    }),
  ],
});
