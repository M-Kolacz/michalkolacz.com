import { captureException } from "@sentry/react";
import { useEffect } from "react";
import { JSX } from "react/jsx-runtime";
import {
  ErrorResponse,
  isRouteErrorResponse,
  Params,
  useParams,
  useRouteError,
} from "react-router";

import { getErrorMessage } from "#app/utils/misc.ts";

type StatusHandler = (info: {
  error: ErrorResponse;
  params: Params;
}) => JSX.Element | null;

export const GeneralErrorBoundary = ({
  defaultStatusHandler = ({ error }) => (
    <p>
      {error.status} {error.data}
    </p>
  ),
  statusHandlers,
  unexpectedErrorHandler = (error) => <p>{getErrorMessage(error)}</p>,
}: {
  defaultStatusHandler?: StatusHandler;
  statusHandlers?: Record<number, StatusHandler>;
  unexpectedErrorHandler?: (error: unknown) => JSX.Element | null;
}) => {
  const error = useRouteError();
  const params = useParams();
  const isResponse = isRouteErrorResponse(error);

  if (typeof document !== "undefined") {
    console.error("🛑", error);
  }

  useEffect(() => {
    if (isResponse) return;

    captureException(error);
  }, [error, isResponse]);

  return (
    <div>
      {isRouteErrorResponse(error)
        ? (statusHandlers?.[error.status] ?? defaultStatusHandler)({
            error,
            params,
          })
        : unexpectedErrorHandler(error)}
    </div>
  );
};
