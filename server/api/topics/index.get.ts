import { topics } from "~~/server/database/schema";
import { db } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
    const allTopics = await db.query.topics.findMany({
        with: {
            subject: true,
            author: {
                columns: {
                    name: true,
                    role: true,
                },
            },
        },
        orderBy: (topics, { desc }) => [desc(topics.createdAt)],
    });

    return allTopics;
});
