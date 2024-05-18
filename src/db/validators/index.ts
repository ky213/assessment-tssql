import { z } from "zod";

//Plans
export const planInsertSchema = z.object({
  name: z
    .string({
      description: "Plan name",
      required_error: "Plan name required",
      message: "Invalid plan name",
    })
    .min(2)
    .max(25),
  description: z
    .string({
      description: "Plan description",
      required_error: "Plan description required",
      message: "Invalid plan description",
    })
    .min(2)
    .max(250),
  price: z.coerce
    .number({
      description: "Plan price",
      required_error: "Plan price required",
      message: "Invalid price",
    })
    .nonnegative({ message: "Price cannot be negative." }),
});

export const planUpdateSchema = planInsertSchema.partial().extend({
  id: z.coerce.number().int({ message: "Invalid plan id." }),
});

export const planUpgradeCostSchema = z.object({
  currentPlanId: z.coerce.number().int({ message: "Invalid plan id." }),
  desiredPlanId: z.coerce.number().int({ message: "Invalid plan id." }),
});
