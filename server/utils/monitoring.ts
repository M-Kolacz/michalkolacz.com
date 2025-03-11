import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

export function init() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 1 : 0,
    denyUrls: [
      /\/resources\/healthcheck/,
      // TODO: be smarter about the public assets...
      /\/build\//,
      /\/favicons\//,
      /\/img\//,
      /\/fonts\//,
      /\/favicon.ico/,
      /\/site\.webmanifest/,
    ],
    integrations: [Sentry.httpIntegration(), nodeProfilingIntegration()],
    tracesSampler(samplingContext) {
      if (samplingContext.request?.url?.includes("/resources/healthcheck")) {
        return 0;
      }
      return 1;
    },
    beforeSendTransaction(event) {
      if (event.request?.headers?.["x-healthcheck"] === "true") {
        return null;
      }

      return event;
    },
  });
}
