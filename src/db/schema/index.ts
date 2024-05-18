import { relations } from "drizzle-orm";
import { sqliteTable, text, uniqueIndex, integer, real } from "drizzle-orm/sqlite-core";

import { ENUMS } from "#src/config/constants";

const boolean = (col: string) => integer(col, { mode: "boolean" });
const timestamp = (col: string) => integer(col, { mode: "timestamp" });

export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey().notNull(),
    email: text("email").unique().notNull(),
    name: text("name").notNull(),
    hashedPassword: text("hashedPassword"),
    emailVerified: boolean("emailVerified").default(false).notNull(),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
    locale: text("locale").notNull(),
    timezone: text("timezone"),
    isAdmin: boolean("isAdmin").default(false).notNull(),
  },
  (table) => {
    return {
      emailIdx: uniqueIndex("emailIdx").on(table.email),
    };
  },
);

export const userRelations = relations(users, ({ many }) => ({
  teams: many(teams),
  emailVerifications: many(emailVerifications),
}));

export const emailVerifications = sqliteTable("emailVerifications", {
  id: integer("id").primaryKey().notNull(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" }),
  email: text("email").notNull(),
  otpCode: text("otpCode").notNull(),
  attempts: integer("attempts").default(0).notNull(),
});

export const emailVerificationRelations = relations(emailVerifications, ({ one }) => ({
  user: one(users, {
    fields: [emailVerifications.userId],
    references: [users.id],
  }),
}));

export const emailChangeRequests = sqliteTable("emailChangeRequests", {
  id: integer("id").primaryKey().notNull(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" }),
  newEmail: text("newEmail").notNull(),
  otpCode: text("otpCode").notNull(),
});

export const passwordResetRequests = sqliteTable("passwordResetRequests", {
  id: integer("id").primaryKey().notNull(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" }),
  token: text("token").notNull(),
});

export const teams = sqliteTable("teams", {
  id: integer("id").primaryKey().notNull(),
  name: text("name").unique().notNull(),
  isPersonal: boolean("isPersonal").notNull(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" }),
  subscriptionId: integer("subscriptionId").references(() => subscriptions.id),
});

export const teamsRelations = relations(teams, ({ one }) => ({
  user: one(users, {
    fields: [teams.userId],
    references: [users.id],
  }),
  subscription: one(subscriptions, {
    fields: [teams.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export const plans = sqliteTable("plans", {
  id: integer("id").primaryKey().notNull(),
  name: text("name").unique().notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const subscriptions: ReturnType<typeof sqliteTable> = sqliteTable("subscriptions", {
  id: integer("id").primaryKey().notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  status: text("status", { enum: [ENUMS.SUBSCRIPTION_STATUS_ACTIVE, ENUMS.SUBSCRIPTION_STATUS_INACTIVE] }).notNull(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  planId: integer("planId")
    .notNull()
    .references(() => plans.id, { onDelete: "restrict" }),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" }),
  teamId: integer("teamId")
    .notNull()
    .references(() => teams.id, { onDelete: "restrict", onUpdate: "restrict" }),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id],
  }),
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [subscriptions.teamId],
    references: [teams.id],
  }),
}));

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey().notNull(),
  status: text("status", { enum: [ENUMS.ORDER_STATUS_PENDING, ENUMS.ORDER_STATUS_PAYED] }).notNull(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" }),
  subscriptionId: integer("subscriptionId")
    .notNull()
    .references(() => subscriptions.id, { onDelete: "restrict", onUpdate: "restrict" }),
});

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  subscription: one(subscriptions, {
    fields: [orders.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export const subscriptionActivations = sqliteTable("subscriptionActivations", {
  id: integer("id").primaryKey().notNull(),
  activationDate: timestamp("activationDate").notNull(),
  status: text("status", {
    enum: [ENUMS.SUBSCRIPTION_ACTIVATION_STATUS_PENDING, ENUMS.SUBSCRIPTION_ACTIVATION_STATUS_ACTIVE],
  }).notNull(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  subscriptionId: integer("subscriptionId")
    .notNull()
    .references(() => subscriptions.id, { onDelete: "restrict", onUpdate: "restrict" }),
});

export const subscriptionActivationsRelations = relations(subscriptionActivations, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [subscriptionActivations.subscriptionId],
    references: [subscriptions.id],
  }),
}));
