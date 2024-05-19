import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

import { db, schema } from "#src/db/client";
import { trpcError } from "#src/trpc/core";
import { createCaller, createAuthenticatedCaller } from "../helpers/utils";
import { admin, planBasic, user } from "../helpers/fakes";
import { cleanUp, prepareUsers } from "./plans.setup";
import { TRPCError } from "@trpc/server";
import { fail } from "assert";

describe("plans routes", async () => {
  beforeAll(async () => {
    await prepareUsers();
  });

  afterAll(async () => {
    await cleanUp();
  });

  describe("plans mutation", async () => {
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
  });

  describe("plans query", async () => {
    it("should allow public users to list plans", async () => {
      const planInDb = await db.query.plans.findFirst({
        where: eq(schema.plans.name, planBasic.name),
      });

      const userCaller = createCaller({});
      const plans = await userCaller.plans.plansList();

      if (!(plans instanceof TRPCError)) expect(plans).toMatchObject([planInDb]);
      else fail();
    });
  });
});
