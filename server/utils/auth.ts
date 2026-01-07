import { sessions, users } from "~~/server/database/schema";
import { eq, and, gt } from "drizzle-orm";
import type { H3Event } from "h3";

export async function getUserFromSession(event: H3Event) {
    const sessionId = getCookie(event, "auth_token");
    if (!sessionId) return null;

    const session = await db.query.sessions.findFirst({
        where: and(
            eq(sessions.id, sessionId),
            gt(sessions.expiresAt, new Date()) // Проверяем, что не истекла
        ),
        with: {
            user: {
                columns: { id: true, name: true, role: true, email: true },
            },
        },
    });

    if (!session) {
        deleteCookie(event, "auth_token");
        return null;
    }

    return session.user;
}
