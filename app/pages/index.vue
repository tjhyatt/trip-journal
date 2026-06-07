<script setup lang="ts">
const supabase = useSupabaseClient();
const authStore = useAuthStore();

const isSigningOut = ref(false);

async function signOut() {
  if (isSigningOut.value) {
    return;
  }

  isSigningOut.value = true;
  await supabase.auth.signOut();
  authStore.clearAuth();
  isSigningOut.value = false;
  await navigateTo("/login");
}
</script>

<template>
  <div class="relative">
    <MapWorldMap />
    <div
      class="absolute right-4 top-4 z-10 flex items-center gap-3 rounded-lg border border-white/60 bg-white/90 px-4 py-3 text-sm shadow-sm backdrop-blur"
    >
      <span class="max-w-[38vw] truncate text-zinc-700">
        {{ authStore.email }}
      </span>
      <button
        class="rounded-md bg-zinc-950 px-3 py-2 font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
        type="button"
        :disabled="isSigningOut"
        @click="signOut"
      >
        {{ isSigningOut ? "Signing out..." : "Sign out" }}
      </button>
    </div>
  </div>
</template>
