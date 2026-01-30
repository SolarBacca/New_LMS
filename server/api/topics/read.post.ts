import { topicReads } from "~~/server/database/schema";

export default defineEventHandler(async (event) => {
    const user = await getUserFromSession(event);
    if (!user) throw createError({ statusCode: 401 });

    const body = await readBody(event);
    const topicId = body.topicId;

    if (!topicId) throw createError({ statusCode: 400 });

    await db
        .insert(topicReads)
        .values({
            userId: user.id,
            topicId: Number(topicId),
            lastReadAt: new Date(),
        })
        .onConflictDoUpdate({
            target: [topicReads.userId, topicReads.topicId],
            set: { lastReadAt: new Date() },
        });

    return { success: true };
});
