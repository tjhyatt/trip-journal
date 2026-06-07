<script setup lang="ts">
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const redirectInfo = useSupabaseCookieRedirect();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

watch(
  user,
  async (currentUser) => {
    if (currentUser) {
      authStore.setUser(currentUser);
      await navigateTo(redirectInfo.pluck() || "/");
    }
  },
  { immediate: true },
);

async function signIn() {
  if (isLoading.value) {
    return;
  }

  errorMessage.value = "";
  isLoading.value = true;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  isLoading.value = false;

  if (error) {
    errorMessage.value = error.message;
    return;
  }

  authStore.setAuth(data);

  await navigateTo(redirectInfo.pluck() || "/");
}
</script>

<template>
  <main class="min-h-screen bg-stone-100 text-zinc-950">
    <div class="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <section class="hidden bg-[url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center lg:block">
        <div class="flex h-full items-end bg-zinc-950/35 p-12 text-white">
          <div class="max-w-md">
            <p class="text-sm font-medium uppercase tracking-[0.22em] text-emerald-100">Trip Journal</p>
            <h1 class="mt-3 text-5xl font-semibold leading-tight">Pick up where your last journey left off.</h1>
          </div>
        </div>
      </section>

      <section class="flex items-center justify-center px-5 py-10 sm:px-8">
        <div class="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <p class="text-sm font-medium text-emerald-700">Welcome back</p>
            <h2 class="mt-2 text-3xl font-semibold">Log in</h2>
          </div>

          <form class="mt-8 space-y-5" @submit.prevent="signIn">
            <label class="block">
              <span class="text-sm font-medium text-zinc-700">Email</span>
              <input
                v-model="email"
                class="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2.5 text-base outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                type="email"
                autocomplete="email"
                required
              >
            </label>

            <label class="block">
              <span class="text-sm font-medium text-zinc-700">Password</span>
              <input
                v-model="password"
                class="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2.5 text-base outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                type="password"
                autocomplete="current-password"
                required
              >
            </label>

            <p v-if="errorMessage" class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {{ errorMessage }}
            </p>

            <button
              class="flex w-full items-center justify-center rounded-md bg-zinc-950 px-4 py-2.5 font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
              type="submit"
              :disabled="isLoading"
            >
              {{ isLoading ? "Logging in..." : "Log in" }}
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-zinc-600">
            New here?
            <NuxtLink class="font-medium text-emerald-700 hover:text-emerald-800" to="/register">
              Create an account
            </NuxtLink>
          </p>
        </div>
      </section>
    </div>
  </main>
</template>
