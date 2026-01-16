import { groupSubjects } from "~~/server/database/schema";

export default defineEventHandler(async (event) => {
    const user = await getUserFromSession(event);
    if (!user || user.role !== "head") throw createError({ statusCode: 403 });

    const body = await readBody(event);

    if (!body.groupId || !body.subjectId)
        throw createError({ statusCode: 400 });

    try {
        await db.insert(groupSubjects).values({
            groupId: body.groupId,
            subjectId: body.subjectId,
        });
        return { success: true };
    } catch (e) {
        return { success: false, message: "Связь уже существует" };
    }
});
