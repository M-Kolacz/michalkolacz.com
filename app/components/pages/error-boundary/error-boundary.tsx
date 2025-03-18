import { captureException } from "@sentry/react";
import { getErrorMessage } from "#app/utils/misc.ts";
import {
  ErrorResponse,
  isRouteErrorResponse,
  Params,
  useParams,
  useRouteError,
} from "react-router";
import { JSX } from "react/jsx-runtime";
import { useEffect } from "react";

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
