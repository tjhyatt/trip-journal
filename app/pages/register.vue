<script setup lang="ts">
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

watch(
  user,
  async (currentUser) => {
    if (currentUser) {
      await navigateTo("/");
    }
  },
  { immediate: true },
);

async function signUp() {
  if (isLoading.value) {
    return;
  }

  errorMessage.value = "";
  successMessage.value = "";

  if (password.value.length < 6) {
    errorMessage.value = "Password must be at least 6 characters.";
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Passwords do not match.";
    return;
  }

  isLoading.value = true;

  const redirectTo = process.client ? `${window.location.origin}/confirm` : undefined;
  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: {
        username: username.value,
      },
      emailRedirectTo: redirectTo,
    },
  });

  isLoading.value = false;

  if (error) {
    errorMessage.value = error.message;
    return;
  }

  if (data.session) {
    await navigateTo("/");
    return;
  }

  successMessage.value = "Check your email to confirm your account, then log in.";
}
</script>

<template>
  <main class="min-h-screen bg-stone-100 text-zinc-950">
    <div class="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
      <section class="flex items-center justify-center px-5 py-10 sm:px-8">
        <div class="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <p class="text-sm font-medium text-emerald-700">Start your journal</p>
            <h1 class="mt-2 text-3xl font-semibold">Create an account</h1>
          </div>

          <form class="mt-8 space-y-5" @submit.prevent="signUp">
            <label class="block">
              <span class="text-sm font-medium text-zinc-700">Username</span>
              <input
                v-model="username"
                class="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2.5 text-base outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                type="text"
                autocomplete="username"
                required
              >
            </label>

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
                autocomplete="new-password"
                required
              >
            </label>

            <label class="block">
              <span class="text-sm font-medium text-zinc-700">Confirm password</span>
              <input
                v-model="confirmPassword"
                class="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2.5 text-base outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                type="password"
                autocomplete="new-password"
                required
              >
            </label>

            <p v-if="errorMessage" class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {{ errorMessage }}
            </p>

            <p v-if="successMessage" class="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {{ successMessage }}
            </p>

            <button
              class="flex w-full items-center justify-center rounded-md bg-zinc-950 px-4 py-2.5 font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
              type="submit"
              :disabled="isLoading"
            >
              {{ isLoading ? "Creating account..." : "Create account" }}
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-zinc-600">
            Already have an account?
            <NuxtLink class="font-medium text-emerald-700 hover:text-emerald-800" to="/login">
              Log in
            </NuxtLink>
          </p>
        </div>
      </section>

      <section class="hidden bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center lg:block">
        <div class="flex h-full items-end bg-zinc-950/30 p-12 text-white">
          <div class="max-w-lg">
            <p class="text-sm font-medium uppercase tracking-[0.22em] text-emerald-100">Trip Journal</p>
            <h2 class="mt-3 text-5xl font-semibold leading-tight">Save the places, dates, and stories worth returning to.</h2>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
