<script setup lang="ts">
const user = useSupabaseUser();

watch(
  user,
  async (currentUser) => {
    if (currentUser) {
      await navigateTo("/");
    }
  },
  { immediate: true },
);
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-stone-100 px-5 text-zinc-950">
    <div class="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm">
      <p class="text-sm font-medium text-emerald-700">Confirming account</p>
      <h1 class="mt-2 text-3xl font-semibold">Finishing sign in...</h1>
      <p class="mt-4 text-sm leading-6 text-zinc-600">
        If this page does not move on automatically, your confirmation link may have expired.
      </p>
      <NuxtLink class="mt-6 inline-flex rounded-md bg-zinc-950 px-4 py-2.5 font-medium text-white hover:bg-zinc-800" to="/login">
        Back to login
      </NuxtLink>
    </div>
  </main>
</template>
