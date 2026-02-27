import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

// Example table — expand as needed
export const articles = sqliteTable(
  "articles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("articles_slug_idx").on(table.slug),
    index("articles_published_at_idx").on(table.publishedAt),
  ]
);
