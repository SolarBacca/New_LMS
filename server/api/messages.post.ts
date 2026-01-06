import { messages } from "../database/schema";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    if (!body.topicId || !body.content) {
        throw createError({
            statusCode: 400,
            statusMessage: "Topic ID and content are required",
        });
    }

    // !!!TODO: CHANGE THIS LATER
    const newMessage = await db
        .insert(messages)
        .values({
            topicId: body.topicId,
            userId: 1, // HARDCODE
            content: body.content,
            isPrivate: false,
        })
        .returning()
        .get();

    return newMessage;
});
