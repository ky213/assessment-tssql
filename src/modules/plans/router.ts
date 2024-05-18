import { eq } from "drizzle-orm";

import { schema, db } from "#src/db/client";
import { insertPlanSchema, updatePlanSchema } from "#src/db/validators";
import { router, trpcError, publicProcedure, protectedProcedure } from "#src/trpc/core";

export const plans = router({
  plansList: publicProcedure.query(async () => {
    try {
      return await db.query.plans.findMany();
    } catch (error) {
      console.error("Error fetching plans", error);
      return [];
    }
  }),

  planCreate: protectedProcedure.input(insertPlanSchema).mutation(async ({ input }) => {
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
    } catch (error) {
      console.error(error);
      return {
        success: false,
      };
    }
  }),
  planUpdate: protectedProcedure.input(updatePlanSchema).mutation(async ({ input }) => {
    try {
      await db
        .update(schema.plans)
        .set({
          name: input.name,
          price: input.price,
          updatedAt: new Date(),
        })
        .where(eq(schema.plans.id, input.id));
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
      };
    }
  }),

  planUpgardeCost: protectedProcedure.query(async ({ input }) => {
    try {
      //const current plan
      //const desired plan
      //
      //check if desired plan > current plan
      //
      //const diff(%) 100- ((current plan / desired plan price) * 100 )
      //const remaining days in current plan
      //
      //cost = currentdaye + (remaing days * diff(%))
      //
      //return cost
    } catch (error) {
      return new trpcError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
});
