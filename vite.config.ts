import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import legacy from "@vitejs/plugin-legacy";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    legacy({
      targets: [
        'iOS >= 13',
        'Safari >= 13',
        'Chrome >= 80',
        'Firefox >= 78',
        'Samsung >= 12',
      ],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    }),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  build: {
    target: ['es2015', 'safari13'],
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          leaflet: ['leaflet'],
          i18n: ['i18next', 'react-i18next'],
        },
      },
    },
  },
}));
