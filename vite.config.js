import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-big-calendar") || id.includes("date-fns")) {
              return "calendar-vendor";
            }
            if (id.includes("@reduxjs") || id.includes("react-redux")) {
              return "redux-vendor";
            }
            if (id.includes("react-router-dom")) {
              return "router-vendor";
            }
            if (id.includes("lucide-react")) {
              return "icons-vendor";
            }
            return "vendor";
          }
        },
      },
    },
  },
});