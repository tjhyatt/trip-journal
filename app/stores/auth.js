export const useAuthStore = defineStore("auth", () => {
  const session = ref(null);
  const user = ref(null);

  const isAuthenticated = computed(() => Boolean(user.value?.id));
  const userId = computed(() => user.value?.id || null);
  const email = computed(() => user.value?.email || "");
  const metadata = computed(() => user.value?.user_metadata || {});
  const username = computed(() => metadata.value.username || "");
  const avatarUrl = computed(
    () => metadata.value.avatar_url || metadata.value.picture || "",
  );
  const displayName = computed(
    () =>
      metadata.value.full_name || username.value || email.value || "Traveler",
  );

  function setSession(nextSession) {
    session.value = nextSession || null;
    user.value = nextSession?.user || null;
  }

  function setUser(nextUser) {
    user.value = nextUser || null;

    if (session.value && !nextUser) {
      session.value = null;
    }
  }

  function setAuth(authData) {
    setSession(authData?.session || null);

    if (!session.value && authData?.user) {
      setUser(authData.user);
    }
  }

  function clearAuth() {
    session.value = null;
    user.value = null;
  }

  async function syncFromSupabase() {
    const supabase = useSupabaseClient();
    const { data } = await supabase.auth.getSession();

    setSession(data.session);

    return data.session;
  }

  function hasUserId(id) {
    return Boolean(id && userId.value === id);
  }

  function profilePath(fallbackUsername = username.value) {
    return fallbackUsername ? `/user/${fallbackUsername}` : null;
  }

  return {
    session,
    user,
    isAuthenticated,
    userId,
    email,
    metadata,
    username,
    avatarUrl,
    displayName,
    setSession,
    setUser,
    setAuth,
    clearAuth,
    syncFromSupabase,
    hasUserId,
    profilePath,
  };
});
