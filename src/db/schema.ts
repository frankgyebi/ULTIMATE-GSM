import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const repairRequests = pgTable(
  "repair_requests",
  {
    id: serial("id").primaryKey(),
    reference: varchar("reference", { length: 20 }).notNull().unique(),
    brand: varchar("brand", { length: 80 }).notNull(),
    model: varchar("model", { length: 160 }).notNull(),
    serviceId: varchar("service_id", { length: 40 }).notNull(),
    serviceName: varchar("service_name", { length: 80 }).notNull(),
    chips: text("chips").notNull().default("[]"),
    description: text("description").notNull().default(""),
    customerName: varchar("customer_name", { length: 120 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull(),
    email: varchar("email", { length: 180 }),
    contactMethod: varchar("contact_method", { length: 20 }).notNull(),
    fulfillment: varchar("fulfillment", { length: 20 }).notNull(),
    preferredDate: varchar("preferred_date", { length: 12 }).notNull(),
    timeSlot: varchar("time_slot", { length: 20 }).notNull(),
    consent: boolean("consent").notNull().default(false),
    status: varchar("status", { length: 32 }).notNull().default("received"),
    isSample: boolean("is_sample").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("repair_requests_date_idx").on(table.preferredDate)],
);

export const statusEvents = pgTable(
  "status_events",
  {
    id: serial("id").primaryKey(),
    requestId: integer("request_id")
      .notNull()
      .references(() => repairRequests.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 32 }).notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("status_events_request_idx").on(table.requestId)],
);

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  email: varchar("email", { length: 180 }),
  topic: varchar("topic", { length: 80 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
