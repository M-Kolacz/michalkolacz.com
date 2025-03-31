import { remember } from "@epic-web/remember";
import { PrismaClient } from "@prisma/client/index.js";

import { styleText } from "node:util";

export const prisma = remember("prisma", () => {
  const logThreshold = 20;

  const client = new PrismaClient({
    log: [
      { level: "query", emit: "event" },
      { level: "error", emit: "stdout" },
      { level: "warn", emit: "stdout" },
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

  void client.$connect();
  return client;
});
