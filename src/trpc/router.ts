import { router } from "./core";

import { auth } from "#src/modules/auth/router";
import { account } from "#src/modules/users/router";
import { teams } from "#src/modules/teams/router";
import { plans } from "#src/modules/plans/router";

export const appRouter = router({
  auth,
  // protected
  account,
  teams,
  plans,
});

export type AppRouter = typeof appRouter;
