import { topics, teacherSubjects } from "~~/server/database/schema";
import { eq, and } from "drizzle-orm";

export default defineEventHandler(async (event) => {
    const user = await getUserFromSession(event);
    if (!user) throw createError({ statusCode: 401 });

    const body = await readBody(event);

    if (!body.title || !body.subjectId) {
        throw createError({ statusCode: 400, message: "Данные неполные" });
    }

    if (user.role === "student") {
        throw createError({
            statusCode: 403,
            message: "Студенты не могут создавать темы",
        });
    }

    if (user.role === "teacher") {
        const hasAccess = await db.query.teacherSubjects.findFirst({
            where: and(
                eq(teacherSubjects.teacherId, user.id),
                eq(teacherSubjects.subjectId, body.subjectId),
            ),
        });

        if (!hasAccess) {
            throw createError({
                statusCode: 403,
                message:
                    "Вы не ведете этот предмет (обратитесь к зав. кафедрой)",
            });
        }
    }

    const newTopic = await db
        .insert(topics)
        .values({
            title: body.title,
            content: body.content || "",
            subjectId: body.subjectId,
            authorId: user.id,
        })
        .returning()
        .get();

    return newTopic;
});
