import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

import { db, schema } from "#src/db/client";
import { trpcError } from "#src/trpc/core";
import { createCaller, createAuthenticatedCaller } from "../helpers/utils";
import { admin, planBasic, user } from "../helpers/fakes";
import { cleanUsers, prepareUsers } from "./plans.setup";

describe("plans routes", async () => {
  beforeAll(async () => {
    await prepareUsers();
  });

  afterAll(async () => {
    await cleanUsers();
  });

  describe("plans create", async () => {
    it("should not allow non-admin users to create plans", async () => {
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
    it("should allow admin users to create plans", async () => {
      const userInDb = await db.query.users.findFirst({
        where: eq(schema.users.email, admin.email),
      });

      const userCaller = createAuthenticatedCaller({
        userId: userInDb!.id,
        isAdmin: userInDb!.isAdmin,
        path: "plans.planCreate",
      });

      await expect(userCaller.plans.planCreate(planBasic)).resolves.toEqual({ success: true });
    });

    it("should allow admin users to update plans", async () => {
      const userInDb = await db.query.users.findFirst({
        where: eq(schema.users.email, admin.email),
      });
      const planInDb = await db.query.plans.findFirst({
        where: eq(schema.plans.name, planBasic.name),
      });

      const userCaller = createAuthenticatedCaller({
        userId: userInDb!.id,
        isAdmin: userInDb!.isAdmin,
        path: "plans.planUpdate",
      });

      const newDescription = "new admin description";

      await userCaller.plans.planUpdate({ id: planInDb!.id, description: newDescription });

      const updatedPlan = await db.query.plans.findFirst({
        where: eq(schema.plans.name, planBasic.name),
      });

      expect(updatedPlan?.description).toBe(newDescription);
    });

    it("should not allow non-admin users to update plans", async () => {
      const userInDb = await db.query.users.findFirst({
        where: eq(schema.users.email, user.email),
      });
      const planInDb = await db.query.plans.findFirst({
        where: eq(schema.plans.name, planBasic.name),
      });

      const userCaller = createAuthenticatedCaller({
        userId: userInDb!.id,
        isAdmin: userInDb!.isAdmin,
        path: "plans.planUpdate",
      });

      const newDescription = "new user description";

      await expect(userCaller.plans.planUpdate({ id: planInDb!.id, description: newDescription })).rejects.toThrowError(
        new trpcError({
          code: "FORBIDDEN",
        }),
      );
    });

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
