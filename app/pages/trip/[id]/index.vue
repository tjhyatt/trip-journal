<script setup lang="ts">
definePageMeta({
  layout: "map",
  name: "ViewTrip",
});

type Trip = {
  id: string;
  userId: string;
  title: string;
  startDate?: string | null;
};

const route = useRoute();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const authStore = useAuthStore();

const isTripFormOpen = ref(false);
const tripTitle = ref("");
const tripStartDate = ref("");
const isCreatingTrip = ref(false);
const tripErrorMessage = ref("");
const tripSuccessMessage = ref("");

const tripId = computed(() => {
  const value = route.params.id;
  return Array.isArray(value) ? value[0] : value;
});

const {
  data: trip,
  error,
  pending,
} = await useAsyncData(
  () => `trip-${tripId.value}`,
  async () => {
    const { data, error: tripError } = await supabase
      .from("trips")
      .select("*")
      .eq("id", tripId.value)
      .maybeSingle();

    if (tripError) {
      throw tripError;
    }

    if (!data) {
      return null;
    }

    return data as Trip;
  },
  {
    watch: [tripId],
  },
);

useHead(() => ({
  title: `${trip.value?.title} | Trip Journal`,
}));

const isOwnTrip = computed(() => {
  if (!authStore.isAuthenticated) return false;
  return authStore.userId === trip.value?.userId;
});

const editTripPath = computed(() =>
  tripId.value ? `/trip/${tripId.value}/edit` : "/",
);
</script>

<template>
  <main class="min-h-screen bg-stone-100 px-5 py-8 text-zinc-950 sm:px-8">
    <div class="mx-auto max-w-4xl">
      <NuxtLink
        class="inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-800"
        to="/"
      >
        Back to map
      </NuxtLink>
      <section
        v-if="pending"
        class="mt-8 rounded-lg border border-zinc-200 bg-white p-8 shadow-sm"
      >
        <div class="h-24 w-24 animate-pulse rounded-full bg-zinc-200"></div>
        <div class="mt-6 h-8 w-52 animate-pulse rounded bg-zinc-200"></div>
        <div
          class="mt-4 h-4 w-full max-w-xl animate-pulse rounded bg-zinc-200"
        ></div>
      </section>

      <section
        v-else-if="error"
        class="mt-8 rounded-lg border border-red-200 bg-white p-8 shadow-sm"
      >
        <p class="text-sm font-medium text-red-700">
          Trip unavailable
        </p>
        <h1 class="mt-2 text-3xl font-semibold">Could not load this trip.</h1>
        <p class="mt-3 text-zinc-600">{{ error.message }}</p>
      </section>

      <section
        v-else
        class="mt-8 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm"
      >
        <div
          class="h-36 bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center"
        ></div>

        <div class="px-6 py-8 sm:px-8">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p class="text-sm font-medium uppercase tracking-[0.16em] text-emerald-700">
                Trip details
              </p>
              <h1 class="mt-2 text-3xl font-semibold text-zinc-950">
                {{ trip.title }}
              </h1>
              <p class="mt-2 text-sm text-zinc-500">
                Trip ID: {{ trip.id }}
              </p>
            </div>

            <NuxtLink
              v-if="isOwnTrip"
              class="inline-flex items-center justify-center rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              :to="editTripPath"
            >
              Edit trip
            </NuxtLink>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
