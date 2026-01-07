import { getUserFromSession } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
    const user = await getUserFromSession(event);

    return { user };
});
