<script setup lang="ts">
type UserProfile = {
  user_id: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  friends: unknown;
};

const route = useRoute();
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const isTripFormOpen = ref(false);
const tripTitle = ref("");
const isCreatingTrip = ref(false);
const tripErrorMessage = ref("");
const tripSuccessMessage = ref("");

const username = computed(() => {
  const value = route.params.username;
  return Array.isArray(value) ? value[0] : value;
});

const loggedInUser = await supabase.auth.getUser();

const {
  data: profile,
  error,
  pending,
} = await useAsyncData(
  () => `user-profile-${username.value}`,
  async () => {
    const { data, error: profileError } = await supabase
      .from("user_profiles")
      .select("user_id, username, avatar, bio, friends")
      .eq("username", username.value)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    return data as UserProfile | null;
  },
  {
    watch: [username],
  },
);

const displayName = computed(() => profile.value?.username || username.value);

const initials = computed(() => {
  const name = displayName.value || "U";
  return name.slice(0, 2).toUpperCase();
});

const friendCount = computed(() => {
  const friends = profile.value?.friends;

  if (Array.isArray(friends)) {
    return friends.length;
  }

  if (typeof friends === "number") {
    return friends;
  }

  if (friends && typeof friends === "object") {
    return Object.keys(friends).length;
  }

  return 0;
});

const isOwnProfile = computed(() =>
  Boolean(
    profile.value?.user_id &&
    loggedInUser?.data?.user?.id === profile.value.user_id,
  ),
);

function openTripForm() {
  tripErrorMessage.value = "";
  tripSuccessMessage.value = "";
  isTripFormOpen.value = true;
}

function closeTripForm() {
  if (isCreatingTrip.value) {
    return;
  }

  isTripFormOpen.value = false;
  tripTitle.value = "";
  tripErrorMessage.value = "";
}

async function createTrip() {
  if (isCreatingTrip.value) {
    return;
  }

  tripErrorMessage.value = "";
  tripSuccessMessage.value = "";

  const title = tripTitle.value.trim();

  if (!title) {
    tripErrorMessage.value = "Add a title for your trip.";
    return;
  }

  if (!user.value?.id) {
    tripErrorMessage.value = "You need to be logged in to start a trip.";
    return;
  }

  isCreatingTrip.value = true;

  const { error: tripError } = await supabase.from("trips").insert({
    title,
    userId: user.value.id,
  });

  isCreatingTrip.value = false;

  if (tripError) {
    tripErrorMessage.value = tripError.message;
    return;
  }

  tripTitle.value = "";
  isTripFormOpen.value = false;
  tripSuccessMessage.value = "Trip started.";
}

useHead(() => ({
  title: profile.value
    ? `${profile.value.username} | Trip Journal`
    : "User profile | Trip Journal",
}));
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
      {{ loggedInUser }}
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
        <p class="text-sm font-medium text-red-700">Profile unavailable</p>
        <h1 class="mt-2 text-3xl font-semibold">
          Could not load this profile.
        </h1>
        <p class="mt-3 text-zinc-600">{{ error.message }}</p>
      </section>

      <section
        v-else-if="!profile"
        class="mt-8 rounded-lg border border-zinc-200 bg-white p-8 shadow-sm"
      >
        <p class="text-sm font-medium text-emerald-700">No profile found</p>
        <h1 class="mt-2 text-3xl font-semibold">@{{ username }}</h1>
        <p class="mt-3 text-zinc-600">This user profile does not exist yet.</p>
      </section>

      <section
        v-else
        class="mt-8 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm"
      >
        <div
          class="h-36 bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center"
        ></div>

        <div class="px-6 pb-8 sm:px-8">
          <div
            class="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
          >
            <div class="flex items-end gap-4">
              <img
                v-if="profile.avatar"
                class="h-24 w-24 rounded-full border-4 border-white bg-zinc-100 object-cover shadow-sm"
                :alt="`${profile.username} avatar`"
                :src="profile.avatar"
              />
              <div
                v-else
                class="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-emerald-700 text-3xl font-semibold text-white shadow-sm"
              >
                {{ initials }}
              </div>

              <div class="pb-2">
                <h1 class="text-3xl font-semibold">@{{ profile.username }}</h1>
                <p class="mt-1 text-sm text-zinc-500">{{ profile.user_id }}</p>
              </div>
            </div>

            <div class="flex flex-col items-stretch gap-3 sm:items-end">
              <button
                v-if="isOwnProfile"
                class="rounded-md bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                type="button"
                :disabled="isTripFormOpen"
                @click="openTripForm"
              >
                Start New Trip
              </button>

              <div
                class="rounded-md border border-zinc-200 px-4 py-3 text-center"
              >
                <p class="text-2xl font-semibold">{{ friendCount }}</p>
                <p
                  class="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500"
                >
                  Friends
                </p>
              </div>
            </div>
          </div>

          <div
            v-if="isOwnProfile && isTripFormOpen"
            class="mt-8 border-t border-zinc-200 pt-6"
          >
            <form class="max-w-xl space-y-4" @submit.prevent="createTrip">
              <label class="block">
                <span class="text-sm font-medium text-zinc-700"
                  >Trip title</span
                >
                <input
                  v-model="tripTitle"
                  class="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2.5 text-base outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                  type="text"
                  autocomplete="off"
                  required
                />
              </label>

              <p
                v-if="tripErrorMessage"
                class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {{ tripErrorMessage }}
              </p>

              <div class="flex flex-wrap gap-3">
                <button
                  class="rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                  type="submit"
                  :disabled="isCreatingTrip"
                >
                  {{ isCreatingTrip ? "Starting..." : "Create Trip" }}
                </button>
                <button
                  class="rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400"
                  type="button"
                  :disabled="isCreatingTrip"
                  @click="closeTripForm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <p
            v-if="isOwnProfile && tripSuccessMessage"
            class="mt-6 max-w-xl rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
          >
            {{ tripSuccessMessage }}
          </p>

          <div class="mt-8 border-t border-zinc-200 pt-6">
            <h2
              class="text-sm font-medium uppercase tracking-[0.16em] text-zinc-500"
            >
              Bio
            </h2>
            <p
              class="mt-3 max-w-2xl whitespace-pre-line leading-7 text-zinc-700"
            >
              {{ profile.bio || "No bio yet." }}
            </p>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
