import { subjects } from "~~/server/database/schema";

export default defineEventHandler(async (event) => {
    const user = await getUserFromSession(event);
    if (!user || user.role !== "head") throw createError({ statusCode: 403 });

    const body = await readBody(event);
    if (!body.name) throw createError({ statusCode: 400 });

    return await db
        .insert(subjects)
        .values({
            name: body.name,
            description: body.description || "",
        })
        .returning()
        .get();
});
