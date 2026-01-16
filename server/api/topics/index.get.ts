import { topics, groupSubjects } from "~~/server/database/schema";
import { eq, inArray, desc } from "drizzle-orm";

export default defineEventHandler(async (event) => {
    const user = await getUserFromSession(event);
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    if (user.role === "student") {
        if (!user.groupId) {
            return [];
        }

        const allowedSubjects = await db
            .select({ id: groupSubjects.subjectId })
            .from(groupSubjects)
            .where(eq(groupSubjects.groupId, user.groupId));

        const subjectIds = allowedSubjects.map((s) => s.id);

        if (subjectIds.length === 0) {
            return [];
        }

        return await db.query.topics.findMany({
            where: inArray(topics.subjectId, subjectIds),
            with: {
                subject: true,
                author: { columns: { name: true, role: true } },
            },
            orderBy: [desc(topics.createdAt)],
        });
    }

    return await db.query.topics.findMany({
        with: {
            subject: true,
            author: { columns: { name: true, role: true } },
        },
        orderBy: [desc(topics.createdAt)],
    });
});
