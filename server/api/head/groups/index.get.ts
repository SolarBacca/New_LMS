import { groups, departments } from "~~/server/database/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
    const user = await getUserFromSession(event);
    if (!user || user.role !== "head") {
        throw createError({
            statusCode: 403,
            message: "Только для зав. кафедрой",
        });
    }

    const myDept = await db.query.departments.findFirst({
        where: eq(departments.headId, user.id),
    });

    if (!myDept) {
        return [];
    }

    return await db.query.groups.findMany({
        where: eq(groups.departmentId, myDept.id),
        with: {
            users: {
                columns: { id: true },
            },
        },
    });
});
