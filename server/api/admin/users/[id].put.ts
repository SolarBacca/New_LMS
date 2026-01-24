import { users } from "~~/server/database/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
    const currentUser = await getUserFromSession(event);
    if (!currentUser || currentUser.role !== "admin") {
        throw createError({ statusCode: 403, message: "Доступ запрещен" });
    }

    const id = getRouterParam(event, "id");
    const body = await readBody(event);

    if (!id) throw createError({ statusCode: 400 });

    const updatedUser = await db
        .update(users)
        .set({
            role: body.role,
            isApproved: body.isApproved,
            groupId: body.groupId || null,
        })
        .where(eq(users.id, Number(id)))
        .returning({ id: users.id, name: users.name, role: users.role })
        .get();

    return updatedUser;
});
