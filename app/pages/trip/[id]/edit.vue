<script setup lang="ts">
definePageMeta({
  layout: "map",
  name: "EditTrip",
});

type Trip = {
  id: string;
  userId: string;
  title: string;
  startDate: string | null;
};

const route = useRoute();
const supabase = useSupabaseClient();
const authStore = useAuthStore();

const tripTitle = ref("");
const tripStartDate = ref("");
const isSavingTrip = ref(false);
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
  () => `trip-edit-${tripId.value}`,
  async () => {
    const { data, error: tripError } = await supabase
      .from("trips")
      .select("id, userId, title, startDate")
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

const canEditTrip = computed(() =>
  Boolean(trip.value?.userId && authStore.hasUserId(trip.value.userId)),
);

watch(
  trip,
  (nextTrip) => {
    if (!nextTrip) {
      return;
    }

    tripTitle.value = nextTrip.title || "";
    tripStartDate.value = nextTrip.startDate ? nextTrip.startDate.slice(0, 10) : "";
  },
  { immediate: true },
);

useHead(() => ({
  title: trip.value ? `Edit ${trip.value.title} | Trip Journal` : "Edit trip | Trip Journal",
}));

async function saveTrip() {
  if (isSavingTrip.value) {
    return;
  }

  tripErrorMessage.value = "";
  tripSuccessMessage.value = "";

  const title = tripTitle.value.trim();
  const startDate = tripStartDate.value;

  if (!title) {
    tripErrorMessage.value = "Add a title for your trip.";
    return;
  }

  if (!startDate) {
    tripErrorMessage.value = "Select a start date for your trip.";
    return;
  }

  if (!canEditTrip.value) {
    tripErrorMessage.value = "You do not have permission to edit this trip.";
    return;
  }

  isSavingTrip.value = true;

  const { error: tripError } = await supabase
    .from("trips")
    .update({
      title,
      startDate,
    })
    .eq("id", tripId.value)
    .eq("userId", authStore.userId);

  isSavingTrip.value = false;

  if (tripError) {
    tripErrorMessage.value = tripError.message;
    return;
  }

  tripSuccessMessage.value = "Trip updated.";
  await navigateTo(`/trip/${tripId.value}`);
}
</script>

<template>
  <main class="min-h-screen bg-stone-100 px-5 py-8 text-zinc-950 sm:px-8">
    <div class="mx-auto max-w-4xl">
      <NuxtLink
        class="inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-800"
        :to="tripId ? `/trip/${tripId}` : '/'"
      >
        Back to trip
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
        <p class="text-sm font-medium text-red-700">Trip unavailable</p>
        <h1 class="mt-2 text-3xl font-semibold">Could not load this trip.</h1>
        <p class="mt-3 text-zinc-600">{{ error.message }}</p>
      </section>

      <section
        v-else-if="!trip"
        class="mt-8 rounded-lg border border-zinc-200 bg-white p-8 shadow-sm"
      >
        <p class="text-sm font-medium text-emerald-700">No trip found</p>
        <h1 class="mt-2 text-3xl font-semibold">Trip not found</h1>
        <p class="mt-3 text-zinc-600">This trip does not exist anymore.</p>
      </section>

      <section
        v-else-if="!canEditTrip"
        class="mt-8 rounded-lg border border-zinc-200 bg-white p-8 shadow-sm"
      >
        <p class="text-sm font-medium text-red-700">Edit restricted</p>
        <h1 class="mt-2 text-3xl font-semibold">You can’t edit this trip.</h1>
        <p class="mt-3 text-zinc-600">
          Only the trip owner can change the title or start date.
        </p>
      </section>

      <section
        v-else
        class="mt-8 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm"
      >
        <div
          class="h-36 bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center"
        ></div>

        <div class="px-6 py-8 sm:px-8">
          <p class="text-sm font-medium uppercase tracking-[0.16em] text-emerald-700">
            Edit trip
          </p>
          <h1 class="mt-2 text-3xl font-semibold text-zinc-950">
            Update your trip details
          </h1>

          <form class="mt-8 max-w-xl space-y-4" @submit.prevent="saveTrip">
            <label class="block">
              <span class="text-sm font-medium text-zinc-700">Trip title</span>
              <input
                v-model="tripTitle"
                class="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2.5 text-base outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                type="text"
                autocomplete="off"
                required
              />
            </label>

            <label class="block">
              <span class="text-sm font-medium text-zinc-700">Start date</span>
              <input
                v-model="tripStartDate"
                class="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2.5 text-base outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                type="date"
                required
              />
            </label>

            <p
              v-if="tripErrorMessage"
              class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {{ tripErrorMessage }}
            </p>

            <p
              v-if="tripSuccessMessage"
              class="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
            >
              {{ tripSuccessMessage }}
            </p>

            <div class="flex flex-wrap gap-3">
              <button
                class="rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                type="submit"
                :disabled="isSavingTrip"
              >
                {{ isSavingTrip ? "Saving..." : "Save Changes" }}
              </button>

              <NuxtLink
                class="rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                :to="`/trip/${tripId}`"
              >
                Cancel
              </NuxtLink>
            </div>
          </form>
        </div>
      </section>
    </div>
  </main>
</template>
