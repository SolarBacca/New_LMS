import { users, sessions } from "~~/server/database/schema";
import { eq } from "drizzle-orm";
import { compareSync } from "bcryptjs";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    if (!body.email || !body.password) {
        throw createError({
            statusCode: 400,
            message: "Введите email и пароль",
        });
    }

    const user = await db.query.users.findFirst({
        where: eq(users.email, body.email),
    });

    if (!user) {
        throw createError({
            statusCode: 401,
            message: "Неверный email или пароль",
        });
    }

    const isValid = compareSync(body.password, user.password);
    if (!isValid) {
        throw createError({
            statusCode: 401,
            message: "Неверный email или пароль",
        });
    }

    if (!user.isApproved) {
        throw createError({
            statusCode: 403,
            message: "Ваш аккаунт ожидает одобрения администратора",
        });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    await db.insert(sessions).values({
        id: token,
        userId: user.id,
        expiresAt: expiresAt,
    });

    setCookie(event, "auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt,
    });

    return {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
    };
});
