/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import { contentSecurity } from "@nichtsam/helmet/content";
import { createReadableStreamFromReadable } from "@react-router/node";
import * as Sentry from "@sentry/node";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import {
  ActionFunctionArgs,
  HandleDocumentRequestFunction,
  LoaderFunctionArgs,
} from "react-router";
import { ServerRouter } from "react-router";

import { init, getEnv } from "./utils/env.server";
import { NonceProvider } from "./utils/nonce-provider";
import { makeTimings } from "./utils/timing.server";

import crypto from "node:crypto";
import { PassThrough } from "node:stream";

export const streamTimeout = 5000;

init();
global.ENV = getEnv();

const MODE = process.env.NODE_ENV ?? "development";

type DocRequestArgs = Parameters<HandleDocumentRequestFunction>;

export default function handleRequest(...args: DocRequestArgs) {
  const [request, responseStatusCode, responseHeaders, reactRouterContext] =
    args;

  if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
    responseHeaders.append("Document-Policy", "js-profiling");
  }

  const callbackName = isbot(request.headers.get("user-agent"))
    ? "onAllReady"
    : "onShellReady";

  const nonce = crypto.randomBytes(16).toString("hex");
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    let didError = false;

    const timings = makeTimings("render", "renderToPipeableStream");

    const { pipe, abort } = renderToPipeableStream(
      <NonceProvider value={nonce}>
        <ServerRouter
          nonce={nonce}
          context={reactRouterContext}
          url={request.url}
        />
      </NonceProvider>,
      {
        [callbackName]: () => {
          const body = new PassThrough();
          responseHeaders.set("Content-Type", "text/html");
          responseHeaders.append("Server-Timing", timings.toString());
          console.log({ nonce, MODE }, "FROM ENTRY.SERVER");
          contentSecurity(responseHeaders, {
            crossOriginEmbedderPolicy: false,
            contentSecurityPolicy: {
              // NOTE: Remove reportOnly when you're ready to enforce this CSP
              reportOnly: true,
              directives: {
                fetch: {
                  "connect-src": [
                    MODE === "development" ? "ws:" : undefined,
                    process.env.SENTRY_DSN ? "*.sentry.io" : undefined,
                    "'self'",
                  ],
                  "font-src": ["'self'"],
                  "frame-src": ["'self'"],
                  "img-src": ["'self'", "data:"],
                  "script-src": [
                    "'strict-dynamic'",
                    "'self'",
                    `'nonce-${nonce}'`,
                  ],
                  "script-src-attr": [`'nonce-${nonce}'`],
                },
              },
            },
          });

          resolve(
            new Response(createReadableStreamFromReadable(body), {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            })
          );
          pipe(body);
        },
        onShellError: (error: unknown) => {
          reject(error);
        },
        onError: () => {
          didError = true;
        },
        nonce,
      }
    );

    setTimeout(abort, streamTimeout + 5000);
  });
}

export function handleError(
  error: unknown,
  { request }: LoaderFunctionArgs | ActionFunctionArgs
): void {
  if (request.signal.aborted) return;

  if (error instanceof Error) {
    console.error("🛑", String(error.stack));
  } else {
    console.error("🛑", error);
  }

  Sentry.captureException(error);
}
