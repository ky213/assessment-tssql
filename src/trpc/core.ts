import { initTRPC, TRPCError } from "@trpc/server";
import type { createContext } from "./context";
import { clearTokens, verifyAccessToken } from "../modules/auth/model";
import { ADMIN_PROCEDURES } from "#src/config/constants";
const t = initTRPC.context<typeof createContext>().create();

export const middleware = t.middleware;
export const router = t.router;
export const publicProcedure = t.procedure;
export const trpcError = TRPCError;
export const createCallerFactory = t.createCallerFactory;

// user procedure
const isUser = middleware(({ ctx: { req, res }, next }) => {
  try {
    const { userId, isAdmin } = verifyAccessToken({ req });
    return next({
      ctx: {
        user: { userId, isAdmin },
      },
    });
  } catch (error) {
    clearTokens({ res });
    throw new trpcError({
      code: "UNAUTHORIZED",
    });
  }
});

const isAdmin = middleware(async ({ ctx, next }) => {
  const requiresAdmin = ADMIN_PROCEDURES.includes(ctx.target);

  if (requiresAdmin && !ctx.user.isAdmin) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next();
});

export const protectedProcedure = publicProcedure.use(isUser).use(isAdmin);
