import { groups, departments } from "~~/server/database/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
    const user = await getUserFromSession(event);
    if (!user || user.role !== "head") throw createError({ statusCode: 403 });

    const body = await readBody(event);
    if (!body.name) throw createError({ statusCode: 400 });

    const myDept = await db.query.departments.findFirst({
        where: eq(departments.headId, user.id),
    });

    if (!myDept) {
        throw createError({
            statusCode: 400,
            message: "За вами не закреплена кафедра",
        });
    }

    return await db
        .insert(groups)
        .values({
            name: body.name,
            departmentId: myDept.id,
        })
        .returning()
        .get();
});
