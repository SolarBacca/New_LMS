export default defineNuxtRouteMiddleware(async (to) => {
    const user = useUser();

    if (to.path === "/login") return;

    if (!user.value) {
        try {
            const headers = useRequestHeaders(["cookie"]);

            const { user: fetchedUser } = await $fetch<{ user: any }>(
                "/api/auth/user",
                {
                    headers,
                }
            );

            if (fetchedUser) {
                user.value = fetchedUser;
            }
        } catch (e) {
            console.error("Ошибка сессии:", e);
            user.value = null;
        }
    }

    if (!user.value) {
        return navigateTo("/login");
    }
});
