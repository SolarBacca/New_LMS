import { subjects } from "~~/server/database/schema";
import { desc } from "drizzle-orm";

export default defineEventHandler(async (event) => {
    const user = await getUserFromSession(event);
    if (!user || user.role !== "head") throw createError({ statusCode: 403 });

    return await db.query.subjects.findMany({
        orderBy: [desc(subjects.id)],
    });
});
