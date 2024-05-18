import type { FastifyPluginCallback } from "fastify";
import { renderTrpcPanel } from "trpc-panel";

import { appRouter } from "./router";
import { ENV_CONFIG } from "#src/env.config";

export const trpcPanel: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get("/panel", async (_, reply) => {
    return reply.header("content-type", "text/html").send(
      renderTrpcPanel(appRouter, {
        url: `http://${ENV_CONFIG.HOST}:${ENV_CONFIG.PORT}/trpc`,
      }),
    );
  });

  done();
};
