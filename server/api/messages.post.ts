import { messages } from "~~/server/database/schema";
import { getUserFromSession } from "../utils/auth";

export default defineEventHandler(async (event) => {
    const user = await getUserFromSession(event);
    if (!user) {
        throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    const body = await readBody(event);

    if (!body.topicId || !body.content) {
        throw createError({ statusCode: 400, message: "Content required" });
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

    return newMessage;
});
