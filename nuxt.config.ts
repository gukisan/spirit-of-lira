export default defineNuxtConfig({
  runtimeConfig: {
    OPEN_AI_KEY: process.env.OPEN_AI_KEY,
    HUGGINGFACE_TOKEN: process.env.HUGGINGFACE_TOKEN,
  },
  modules: [
    "@nuxtjs/tailwindcss",
    [
      "@pinia/nuxt",
      {
        autoImports: ["defineStore"],
      },
    ],
  ],
  imports: {
    dirs: [
      "boot/**/*.{js,ts}",
      "core/**/*.{js,ts}",
      "data/**/*.{js,ts}",
      "logic/**/*.{js,ts}",
    ],
  },
  components: {
    dirs: ["@/UI"],
  },
  plugins: ["@/boot/importer.ts", "@/boot/starter.ts"],
  css: ["@/tailwind.css"],

  // important for correct work of importer
  vite: {
    build: {
      minify: false,
    },
  },

  // local build not working with sourcemap
  sourcemap: false,
})
