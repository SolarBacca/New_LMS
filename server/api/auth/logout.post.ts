import { sessions } from "~~/server/database/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
    const sessionId = getCookie(event, "auth_token");

    if (sessionId) {
        await db.delete(sessions).where(eq(sessions.id, sessionId));
    }

    deleteCookie(event, "auth_token");

    return { success: true };
});
