import { LoaderFunction } from "react-router";

import { GeneralErrorBoundary } from "#app/components/pages/error-boundary.tsx";

export const loader: LoaderFunction = () => {
  throw new Response("Page not found", { status: 404 });
};

export function action() {
  throw new Response("Not found", { status: 404 });
}

export default function NotFound() {
  return <GeneralErrorBoundary />;
}

export const ErrorBoundary = () => <GeneralErrorBoundary />;
