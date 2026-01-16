import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    role: text("role", { enum: ["admin", "head", "teacher", "student"] })
        .notNull()
        .default("student"),
    groupId: integer("group_id").references(() => groups.id),
    isApproved: integer("is_approved", { mode: "boolean" }).default(false),
    createdAt: integer("created_at", { mode: "timestamp" }).default(
        sql`CURRENT_TIMESTAMP`
    ),
});

export const departments = sqliteTable("departments", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    headId: integer("head_id"),
});

export const groups = sqliteTable("groups", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    departmentId: integer("department_id")
        .references(() => departments.id, { onDelete: "cascade" })
        .notNull(),
});

export const subjects = sqliteTable("subjects", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    description: text("description"),
});

export const groupSubjects = sqliteTable("group_subjects", {
    groupId: integer("group_id")
        .references(() => groups.id, { onDelete: "cascade" })
        .notNull(),
    subjectId: integer("subject_id")
        .references(() => subjects.id, { onDelete: "cascade" })
        .notNull(),
});

export const topics = sqliteTable("topics", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    subjectId: integer("subject_id")
        .references(() => subjects.id, { onDelete: "cascade" })
        .notNull(),
    title: text("title").notNull(),
    content: text("content"),
    authorId: integer("author_id").references(() => users.id),
    createdAt: integer("created_at", { mode: "timestamp" }).default(
        sql`CURRENT_TIMESTAMP`
    ),
});

export const messages = sqliteTable("messages", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    topicId: integer("topic_id")
        .references(() => topics.id, { onDelete: "cascade" })
        .notNull(),
    userId: integer("user_id")
        .references(() => users.id)
        .notNull(),
    content: text("content").notNull(),
    parentId: integer("parent_id"),
    isPrivate: integer("is_private", { mode: "boolean" }).default(false),
    createdAt: integer("created_at", { mode: "timestamp" }).default(
        sql`CURRENT_TIMESTAMP`
    ),
});

export const usersRelations = relations(users, ({ one }) => ({
    group: one(groups, {
        fields: [users.groupId],
        references: [groups.id],
    }),
    session: one(sessions, {
        fields: [users.id],
        references: [sessions.userId],
    }),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
    department: one(departments, {
        fields: [groups.departmentId],
        references: [departments.id],
    }),
    users: many(users),
}));

export const topicsRelations = relations(topics, ({ many, one }) => ({
    messages: many(messages),
    author: one(users, {
        fields: [topics.authorId],
        references: [users.id],
    }),
    subject: one(subjects, {
        fields: [topics.subjectId],
        references: [subjects.id],
    }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
    user: one(users, {
        fields: [messages.userId],
        references: [users.id],
    }),
    topic: one(topics, {
        fields: [messages.topicId],
        references: [topics.id],
    }),
}));

export const departmentsRelations = relations(departments, ({ one, many }) => ({
    head: one(users, {
        fields: [departments.headId],
        references: [users.id],
    }),
    groups: many(groups),
}));

export const sessions = sqliteTable("sessions", {
    id: text("id").primaryKey(),
    userId: integer("user_id")
        .references(() => users.id)
        .notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}));
