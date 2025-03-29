import { remember } from "@epic-web/remember";
import { PrismaClient } from "@prisma/client/index.js";
import * as Sentry from "@sentry/node";

import { styleText } from "node:util";

export const prisma = remember("prisma", () => {
  const logThreshold = 20;

  const client = new PrismaClient({
    log: [
      { level: "query", emit: "event" },
      { level: "error", emit: "event" },
      { level: "warn", emit: "event" },
      { level: "info", emit: "stdout" },
    ],
  });
  client.$on("query", async (event) => {
    if (event.duration < logThreshold) return;
    const color =
      event.duration < logThreshold * 1.1
        ? "green"
        : event.duration < logThreshold * 1.2
        ? "blue"
        : event.duration < logThreshold * 1.3
        ? "yellow"
        : event.duration < logThreshold * 1.4
        ? "redBright"
        : "red";
    const dur = styleText(color, `${event.duration}ms`);
    console.info(`prisma:query - ${dur} - ${event.query}`);
  });

  client.$on("error", (event) => {
    const prismaError = new Error(event.message);
    Sentry.captureException(prismaError, {
      extra: {
        ...event,
      },
    });
    console.error("🛑", "Prisma error", event.message, event.target);
  });
  void client.$connect();
  return client;
});
