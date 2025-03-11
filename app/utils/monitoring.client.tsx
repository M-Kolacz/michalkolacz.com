import * as Sentry from "@sentry/react";
import React from "react";
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router";

export function init() {
  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    environment: ENV.MODE,
    beforeSend(event) {
      if (event.request?.url) {
        const url = new URL(event.request.url);
        if (
          url.protocol === "chrome-extension:" ||
          url.protocol === "moz-extension:"
        ) {
          return null;
        }
      }

      return event;
    },
    integrations: [
      Sentry.replayIntegration(),
      Sentry.browserProfilingIntegration(),
      Sentry.reactRouterV7BrowserTracingIntegration({
        useEffect: React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
    ],

    tracesSampleRate: 1.0,

    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}
