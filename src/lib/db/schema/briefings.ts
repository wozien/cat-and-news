import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const briefings = pgTable("briefings", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  title: text("title").notNull(),
  markdown: text("markdown").notNull(),
  sourceFeedIds: jsonb("source_feed_ids").$type<string[]>().notNull(),
  modelUsed: text("model_used").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
