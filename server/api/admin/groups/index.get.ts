import { groups } from "~~/server/database/schema";
import { desc } from "drizzle-orm";

export default defineEventHandler(async (event) => {
    const user = await getUserFromSession(event);
    if (!user || user.role !== "admin") {
        throw createError({ statusCode: 403 });
    }

    return await db.query.groups.findMany({
        orderBy: [desc(groups.id)],
        with: {
            department: true,
        },
    });
});
