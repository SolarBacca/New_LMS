import { users } from "~~/server/database/schema";
import { desc } from "drizzle-orm";

export default defineEventHandler(async (event) => {
    const currentUser = await getUserFromSession(event);
    if (!currentUser || currentUser.role !== "admin") {
        throw createError({ statusCode: 403, message: "Доступ запрещен" });
    }

    const allUsers = await db.query.users.findMany({
        orderBy: [desc(users.createdAt)],
        columns: {
            id: true,
            name: true,
            email: true,
            role: true,
            isApproved: true,
            groupId: true,
            createdAt: true,
        },
        with: {
            group: true,
        },
    });

    return allUsers;
});
