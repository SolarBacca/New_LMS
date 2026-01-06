import { eq } from "drizzle-orm";
import { topics } from "~~/server/database/schema";
import { db } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, "id");

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: "ID is required" });
    }

    const topic = await db.query.topics.findFirst({
        where: eq(topics.id, Number(id)),
        with: {
            subject: true,
            author: {
                columns: { name: true, role: true },
            },
            messages: {
                with: {
                    user: {
                        columns: { name: true, role: true },
                    },
                },
                orderBy: (messages, { asc }) => [asc(messages.createdAt)],
            },
        },
    });

    if (!topic) {
        throw createError({
            statusCode: 404,
            statusMessage: "Topic not found",
        });
    }

    return topic;
});
