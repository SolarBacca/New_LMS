import {
    messages,
    topics,
    groupSubjects,
    topicReads,
} from "~~/server/database/schema";
import { eq, and } from "drizzle-orm";

export default defineEventHandler(async (event) => {
    const user = await getUserFromSession(event);
    if (!user) throw createError({ statusCode: 401, message: "Unauthorized" });

    const body = await readBody(event);
    if (!body.topicId || !body.content) throw createError({ statusCode: 400 });

    const topic = await db.query.topics.findFirst({
        where: eq(topics.id, body.topicId),
        columns: { subjectId: true },
    });

    if (!topic)
        throw createError({ statusCode: 404, message: "Topic not found" });

    if (user.role === "student") {
        const hasAccess = await db.query.groupSubjects.findFirst({
            where: and(
                eq(groupSubjects.groupId, user.groupId!),
                eq(groupSubjects.subjectId, topic.subjectId),
            ),
        });

        if (!hasAccess) {
            throw createError({
                statusCode: 403,
                message: "Вы не можете писать в эту тему",
            });
        }
    }

    const newMessage = await db
        .insert(messages)
        .values({
            topicId: body.topicId,
            userId: user.id,
            content: body.content,
            isPrivate: false,
        })
        .returning()
        .get();

    const now = new Date();

    await db
        .update(topics)
        .set({ updatedAt: now })
        .where(eq(topics.id, body.topicId));

    await db
        .insert(topicReads)
        .values({
            userId: user.id,
            topicId: body.topicId,
            lastReadAt: now,
        })
        .onConflictDoUpdate({
            target: [topicReads.userId, topicReads.topicId],
            set: { lastReadAt: now },
        });

    return newMessage;
});
