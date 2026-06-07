<script setup lang="ts">
const authStore = useAuthStore();

await authStore.syncFromSupabase();
</script>

<template>
  <NuxtPage />
</template>
