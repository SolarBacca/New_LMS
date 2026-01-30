import { eq, and } from "drizzle-orm";
import { topics, groupSubjects } from "~~/server/database/schema";

export default defineEventHandler(async (event) => {
    const user = await getUserFromSession(event);
    if (!user) throw createError({ statusCode: 401, message: "Unauthorized" });

    const id = getRouterParam(event, "id");
    if (!id) throw createError({ statusCode: 400, message: "ID required" });

    const topic = await db.query.topics.findFirst({
        where: eq(topics.id, Number(id)),
        with: {
            subject: true,
            author: { columns: { id: true, name: true, role: true } },
            messages: {
                with: {
                    user: { columns: { id: true, name: true, role: true } },
                },
                orderBy: (messages, { asc }) => [asc(messages.createdAt)],
            },
        },
    });

    if (!topic)
        throw createError({ statusCode: 404, message: "Topic not found" });

    if (user.role === "student") {
        const accessRecord = await db.query.groupSubjects.findFirst({
            where: and(
                eq(groupSubjects.groupId, user.groupId!),
                eq(groupSubjects.subjectId, topic.subjectId),
            ),
        });

        if (!accessRecord) {
            throw createError({
                statusCode: 403,
                message: "Доступ к материалам этой группы запрещен",
            });
        }
    }

    return topic;
});
