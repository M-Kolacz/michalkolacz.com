import { getHintUtils } from "@epic-web/client-hints";
import {
  clientHint as colorSchemeHint,
  subscribeToSchemeChange,
} from "@epic-web/client-hints/color-scheme";
import { useEffect } from "react";
import { useRevalidator } from "react-router";

import { useOptionalRequestInfo, useRequestInfo } from "./request-info";

const hintUtils = getHintUtils({
  theme: colorSchemeHint,
});

export const { getHints } = hintUtils;

export const useHints = () => {
  const requestInfo = useRequestInfo();
  return requestInfo.hints;
};

export const useOptionalHints = () => {
  const requestInfo = useOptionalRequestInfo();
  return requestInfo?.hints;
};

export const ClientHintCheck = ({ nonce }: { nonce: string }) => {
  const { revalidate } = useRevalidator();
  useEffect(() => {
    subscribeToSchemeChange(() => revalidate());
  }, [revalidate]);

  return (
    <script
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: hintUtils.getClientHintCheckScript(),
      }}
    />
  );
};
