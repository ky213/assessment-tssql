import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

import { db, schema } from "#src/db/client";
import { trpcError } from "#src/trpc/core";
import { createCaller, createAuthenticatedCaller } from "../helpers/utils";
import { planBasic, user } from "../helpers/fakes";
import { cleanUsers } from "./plans.setup";

describe("plans routes", async () => {
  afterAll(async () => {
    await cleanUsers();
  });

  describe("plans create", async () => {
    it("should not allow non-admin users to create plans", async () => {
      await createCaller({}).auth.register(user);

      const userInDb = await db.query.users.findFirst({
        where: eq(schema.users.email, user.email),
      });

      const userCaller = createAuthenticatedCaller({
        userId: userInDb!.id,
        isAdmin: userInDb!.isAdmin,
        path: "plans.planCreate",
      });

      await expect(userCaller.plans.planCreate(planBasic)).rejects.toThrowError(
        new trpcError({
          code: "FORBIDDEN",
        }),
      );
    });
    it("should allow admin users to create plans", async () => {});
    it("should not allow public users to update plans", async () => {});
    it("should allow admin users to update plans", async () => {});
    it("should not allow public users to list plans", async () => {});
  });

  describe("plans update", async () => {
    it("should not allow non-admin users to create plans", async () => {});
    it("should allow admin users to create plans", async () => {});
    it("should not allow non-admin users to update plans", async () => {});
    it("should allow admin users to update plans", async () => {});
    it("should not allow public users to list plans", async () => {});
  });

  describe("plans read", async () => {
    it("should allow public users to list plans", async () => {});
  });
});
