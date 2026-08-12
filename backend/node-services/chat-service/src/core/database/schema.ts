import {
  pgTable,
  varchar,
  text,
  jsonb,
  real,
  integer,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// 1.1 Dialog Table (Configuration)
export const dialogs = pgTable("dialogs", {
  id: varchar("id", { length: 32 }).primaryKey(),
  name: varchar("name", { length: 255 }),
  description: text("description"),
  icon: text("icon"),
  language: varchar("language", { length: 32 }).default("English"),
  llm_id: varchar("llm_id", { length: 128 }),
  llm_setting: jsonb("llm_setting"),
  prompt_type: varchar("prompt_type", { length: 16 }).default("simple"),
  prompt_config: jsonb("prompt_config"),
  meta_data_filter: jsonb("meta_data_filter").default({}),
  similarity_threshold: real("similarity_threshold").default(0.2),
  vector_similarity_weight: real("vector_similarity_weight").default(0.3),
  top_n: integer("top_n").default(6),
  top_k: integer("top_k").default(1024),
  do_refer: varchar("do_refer", { length: 1 }).default("1"),
  rerank_id: varchar("rerank_id", { length: 128 }),
  kb_ids: varchar("kb_ids", { length: 32 })
    .array()
    .default(sql`'{}'::varchar[]`),
  status: varchar("status", { length: 1 }).default("1"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 1.2 Conversation Table (Session)
export const conversations = pgTable(
  "conversations",
  {
    id: varchar("id", { length: 32 }).primaryKey(),
    dialog_id: varchar("dialog_id", { length: 32 })
      .notNull()
      .references(() => dialogs.id),
    name: varchar("name", { length: 255 }),
    user_id: varchar("user_id", { length: 255 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    is_deleted: boolean("is_deleted").default(false),
  },
  (table) => [index("idx_conversation_dialog_id").on(table.dialog_id)],
);

// 1.3 Message Table (Interaction History)
export const messages = pgTable(
  "messages",
  {
    id: varchar("id", { length: 32 }).primaryKey(),
    conversation_id: varchar("conversation_id", { length: 32 })
      .notNull()
      .references(() => conversations.id),
    parent_id: varchar("parent_id", { length: 32 }),
    role: varchar("role", { length: 16 }).notNull(),
    content: text("content").notNull(),
    llm_id: varchar("llm_id", { length: 128 }),
    reference: jsonb("reference").default([]),
    thumbup: boolean("thumbup"),
    feedback: text("feedback"),
    is_deleted: boolean("is_deleted").default(false),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => {
    // Database Indexing Strategy per LLD requirements
    return [
      index("idx_message_conversation_id").on(table.conversation_id),
      index("idx_message_pagination").on(
        table.conversation_id,
        table.created_at.desc(),
      ),
    ];
  },
);
