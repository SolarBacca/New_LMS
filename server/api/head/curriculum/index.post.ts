import { groupSubjects } from "~~/server/database/schema";
import { and, eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
    const user = await getUserFromSession(event);
    if (!user || user.role !== "head") throw createError({ statusCode: 403 });

    const body = await readBody(event);
    if (!body.groupId || !body.subjectId)
        throw createError({ statusCode: 400 });

    const existingLink = await db.query.groupSubjects.findFirst({
        where: and(
            eq(groupSubjects.groupId, body.groupId),
            eq(groupSubjects.subjectId, body.subjectId)
        ),
    });

    if (existingLink) {
        return {
            success: false,
            message: "Эта дисциплина уже назначена группе",
        };
    }

    await db.insert(groupSubjects).values({
        groupId: body.groupId,
        subjectId: body.subjectId,
    });

    return { success: true };
});
