import { subjects, teacherSubjects } from "~~/server/database/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
    const user = await getUserFromSession(event);

    if (!user || !["admin", "head", "teacher"].includes(user.role)) {
        throw createError({ statusCode: 403 });
    }

    if (user.role === "admin") {
        return await db.query.subjects.findMany();
    }

    const mySubjects = await db
        .select({
            id: subjects.id,
            name: subjects.name,
            description: subjects.description,
        })
        .from(subjects)
        .innerJoin(teacherSubjects, eq(subjects.id, teacherSubjects.subjectId))
        .where(eq(teacherSubjects.teacherId, user.id));

    return mySubjects;
});
