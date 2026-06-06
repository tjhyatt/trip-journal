// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: [
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxtjs/supabase",
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "dayjs-nuxt",
    "nuxt-maplibre",
  ],

  supabase: {
    redirect: false,
  },

  vite: {
    optimizeDeps: {
      include: ["maplibre-gl"],
    },
  },
});
