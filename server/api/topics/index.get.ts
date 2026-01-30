import { topics, groupSubjects, topicReads } from "~~/server/database/schema";
import { eq, inArray, desc, and } from "drizzle-orm";

export default defineEventHandler(async (event) => {
    const user = await getUserFromSession(event);
    if (!user) throw createError({ statusCode: 401 });

    let accessibleTopics = [];

    if (user.role === "student") {
        if (!user.groupId) return { topics: [], reads: [] };

        const allowedSubjects = await db
            .select({ id: groupSubjects.subjectId })
            .from(groupSubjects)
            .where(eq(groupSubjects.groupId, user.groupId));

        const subjectIds = allowedSubjects.map((s) => s.id);
        if (subjectIds.length === 0) return { topics: [], reads: [] };

        accessibleTopics = await db.query.topics.findMany({
            where: inArray(topics.subjectId, subjectIds),
            with: {
                subject: true,
                author: { columns: { name: true, role: true } },
            },
            orderBy: [desc(topics.updatedAt)],
        });
    } else {
        accessibleTopics = await db.query.topics.findMany({
            with: {
                subject: true,
                author: { columns: { name: true, role: true } },
            },
            orderBy: [desc(topics.updatedAt)],
        });
    }

    const myReads = await db
        .select()
        .from(topicReads)
        .where(eq(topicReads.userId, user.id));

    return {
        topics: accessibleTopics,
        reads: myReads,
    };
});
