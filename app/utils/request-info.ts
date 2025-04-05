import { useRouteLoaderData } from "react-router";

import { type loader as rootLoader } from "#app/root.tsx";

import { invariantResponse } from "./invariant";

export const useRequestInfo = () => {
  const maybeRequestInfo = useOptionalRequestInfo();
  invariantResponse(maybeRequestInfo, "No requestInfo found in root loader");

  return maybeRequestInfo;
};

export const useOptionalRequestInfo = () => {
  const data = useRouteLoaderData<typeof rootLoader>("root");

  return data?.requestInfo;
};
