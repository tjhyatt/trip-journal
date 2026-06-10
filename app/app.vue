<script setup lang="ts">
const authStore = useAuthStore();

await authStore.syncFromSupabase();
</script>

<template>
  <NuxtLayout>
    <template #map>
      <MapWorldMap />
    </template>
    <template #aside>
      <!-- <UserMenuBar /> -->
      <NuxtPage />
    </template>
    <template #main>
      <!-- <UserMenuBar /> -->
      <NuxtPage />
    </template>
  </NuxtLayout>
</template>
