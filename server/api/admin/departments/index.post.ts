import { departments, users } from "~~/server/database/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
    const user = await getUserFromSession(event);
    if (!user || user.role !== "admin") {
        throw createError({ statusCode: 403 });
    }

    const body = await readBody(event);

    if (!body.name) {
        throw createError({ statusCode: 400, message: "Название обязательно" });
    }

    const newDept = await db
        .insert(departments)
        .values({
            name: body.name,
            headId: body.headId || null,
        })
        .returning()
        .get();

    if (body.headId) {
        await db
            .update(users)
            .set({ role: "head" })
            .where(eq(users.id, body.headId));
    }

    return newDept;
});
