import type { inferAsyncReturnType } from "@trpc/server";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

interface IRequestParams {
  path?: string;
}

interface IUser {
  userId?: number;
  isAdmin?: boolean;
}

export function createContext({ req, res }: CreateFastifyContextOptions) {
  const params = req.params as IRequestParams;
  const target: string = params.path ?? "";
  const user: IUser = {};

  return { req, res, user, target };
}

export type Context = inferAsyncReturnType<typeof createContext>;
