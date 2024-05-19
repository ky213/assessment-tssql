import { and, eq } from "drizzle-orm";
import { differenceInCalendarDays } from "date-fns";

import { schema, db } from "#src/db/client";
import { planInsertSchema, planUpdateSchema, planUpgradeCostSchema } from "#src/db/validators";
import { router, trpcError, publicProcedure, protectedProcedure } from "#src/trpc/core";
import { ENUMS } from "#src/config/constants";

export const plans = router({
  plansList: publicProcedure.query(async () => {
    try {
      return await db.query.plans.findMany();
    } catch (error) {
      console.error("Error fetching plans", error);
      return new trpcError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  planCreate: protectedProcedure.input(planInsertSchema).mutation(async ({ input }) => {
    try {
      await db
        .insert(schema.plans)
        .values({
          price: input.price,
          name: input.name,
          description: input.description,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return {
        success: true,
      };
    } catch (error: any) {
      console.error(error);

      return new trpcError(error);
    }
  }),
  planUpdate: protectedProcedure.input(planUpdateSchema).mutation(async ({ input }) => {
    try {
      await db
        .update(schema.plans)
        .set({
          name: input.name,
          price: input.price,
          description: input.description,
          updatedAt: new Date(),
        })
        .where(eq(schema.plans.id, input.id));
      return {
        success: true,
      };
    } catch (error: any) {
      return new trpcError(error);
    }
  }),
  planUpgardeCost: protectedProcedure.input(planUpgradeCostSchema).query(async ({ ctx, input }) => {
    try {
      //Check plans existence
      const currentPlan = await db.query.plans.findFirst({
        where: eq(schema.plans.id, input.currentPlanId),
      });

      const desiredPlan = await db.query.plans.findFirst({
        where: eq(schema.plans.id, input.desiredPlanId),
      });

      if (!currentPlan || !desiredPlan)
        return new trpcError({ code: "NOT_FOUND", message: "Either plans doesn't exist." });

      //check if desired plan > current plan
      if (desiredPlan.price <= currentPlan.price)
        return new trpcError({
          code: "BAD_REQUEST",
          message: "Desired plan price should be be higher than current plan's price.",
        });

      //check active subscription
      const activeSubscription = await db.query.subscriptionActivations.findFirst({
        where: and(eq(schema.subscriptionActivations.status, ENUMS.SUBSCRIPTION_ACTIVATION_STATUS_ACTIVE)),
        with: {
          subscription: {
            where: (subscription, { eq }) => eq(subscription.userId, ctx.user.userId),
          },
        },
      });

      if (!activeSubscription)
        return new trpcError({
          code: "NOT_FOUND",
          message: "No active subscriptions.",
        });

      //find remaining days
      //@ts-ignore TODO:set correct endDate type
      const endDate = activeSubscription?.subscription?.endDate;
      const remainingDays = differenceInCalendarDays(new Date(endDate), new Date());

      //day cost: assume monthly pricing
      const currentDayCost = currentPlan.price / 30;

      //upgrade cost
      const upgradeRatio = desiredPlan.price / currentPlan.price;
      const upgradeDayCost = currentDayCost * upgradeRatio;
      const totalUpgradeCost = upgradeDayCost * remainingDays;

      //return upgrade cost
      return { remainingDays, upgradeDayCost, totalUpgradeCost };
    } catch (error) {
      return new trpcError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
});
