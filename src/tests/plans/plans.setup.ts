import { db, schema } from "#src/db/client";
import { sql, inArray } from "drizzle-orm";
import { admin, user } from "../helpers/fakes";

export const prepareUsers = async () => {
  const now = new Date();

  await db.insert(schema.users).values({ ...admin, createdAt: now, updatedAt: now });
  await db.insert(schema.users).values({ ...user, createdAt: now, updatedAt: now });

  console.log("✅ Users prepared.");
};

export const cleanUsers = async () => {
  //To bypass foreign_key constraint error
  db.run(sql.raw(`PRAGMA foreign_keys = OFF;`));

  await db.delete(schema.users).where(inArray(schema.users.email, [admin.email, user.email]));

  console.log("✅ Users cleaned.");
};
