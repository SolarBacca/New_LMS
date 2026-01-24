import { teacherSubjects, users } from "~~/server/database/schema";
import { eq, and } from "drizzle-orm";

export default defineEventHandler(async (event) => {
    const user = await getUserFromSession(event);
    if (!user || user.role !== "head") throw createError({ statusCode: 403 });

    const body = await readBody(event);

    if (!body.teacherId || !body.subjectId)
        throw createError({ statusCode: 400 });

    // MAYBE: add check if it is teacher?

    const exists = await db.query.teacherSubjects.findFirst({
        where: and(
            eq(teacherSubjects.teacherId, body.teacherId),
            eq(teacherSubjects.subjectId, body.subjectId),
        ),
    });

    if (exists) {
        return { success: false, message: "Уже назначено" };
    }

    await db.insert(teacherSubjects).values({
        teacherId: body.teacherId,
        subjectId: body.subjectId,
    });

    return { success: true };
});
