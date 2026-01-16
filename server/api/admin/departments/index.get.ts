import { departments } from "~~/server/database/schema";
import { desc } from "drizzle-orm";

export default defineEventHandler(async (event) => {
    const user = await getUserFromSession(event);
    if (!user || user.role !== "admin") {
        throw createError({ statusCode: 403 });
    }

    return await db.query.departments.findMany({
        with: {
            head: {
                columns: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            groups: true,
        },
    });
});
