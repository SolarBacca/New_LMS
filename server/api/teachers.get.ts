import { users } from "~~/server/database/schema";
import { or, eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
    const user = await getUserFromSession(event);

    if (!user || !["admin", "head"].includes(user.role)) {
        throw createError({ statusCode: 403, message: "Доступ запрещен" });
    }

    const teachers = await db.query.users.findMany({
        where: or(eq(users.role, "teacher"), eq(users.role, "head")),
        columns: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    });

    return teachers;
});
