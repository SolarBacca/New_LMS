import { users } from "~~/server/database/schema";
import { eq } from "drizzle-orm";
import { hashSync } from "bcryptjs";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    if (!body.email || !body.password || !body.name) {
        throw createError({ statusCode: 400, message: "Все поля обязательны" });
    }

    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, body.email),
    });

    if (existingUser) {
        throw createError({
            statusCode: 409,
            message: "Пользователь с таким email уже существует",
        });
    }

    const hashedPassword = hashSync(body.password, 10);

    const newUser = await db
        .insert(users)
        .values({
            email: body.email,
            name: body.name,
            password: hashedPassword,
            role: "student",
            isApproved: false,
        })
        .returning({ id: users.id, email: users.email })
        .get();

    return { success: true, user: newUser };
});
