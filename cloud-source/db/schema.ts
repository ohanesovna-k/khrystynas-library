import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const libraries = sqliteTable('libraries', {
 userId: text('user_id').primaryKey(),
 revision: integer('revision').notNull(),
 blobKey: text('blob_key').notNull(),
 updatedAt: text('updated_at').notNull()
});
export const accounts = sqliteTable('accounts', {
 id: text('id').primaryKey(), nickname: text('nickname').notNull(),
 nicknameKey: text('nickname_key').notNull().unique(), passwordHash: text('password_hash').notNull(),
 recoveryHash: text('recovery_hash').notNull(), createdAt: integer('created_at').notNull()
});
export const sessions = sqliteTable('sessions', {
 tokenHash: text('token_hash').primaryKey(), userId: text('user_id').notNull(), expiresAt: integer('expires_at').notNull()
});
export const authLimits = sqliteTable('auth_limits', {
 key: text('key').primaryKey(), window: integer('window').notNull(), attempts: integer('attempts').notNull()
});
export const deletions = sqliteTable('deletions', { userId: text('user_id').primaryKey(), createdAt: integer('created_at').notNull() });
