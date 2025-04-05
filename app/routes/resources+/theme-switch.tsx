import { useForm, getFormProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, data, useFetcher } from "react-router";
import { z } from "zod";

import { useHints, useOptionalHints } from "#app/utils/client-hints";
import { invariantResponse } from "#app/utils/invariant.ts";
import {
  useOptionalRequestInfo,
  useRequestInfo,
} from "#app/utils/request-info";
import { setTheme } from "#app/utils/theme.server.ts";

export const ThemeFormSchema = z.object({
  theme: z.enum(["system", "light", "dark"]),
  // // this is useful for progressive enhancement
  // redirectTo: z.string().optional(),
});

const themeMap = {
  light: "🌞",
  dark: "🌚",
  system: "🖥️",
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: ThemeFormSchema,
  });

  invariantResponse(submission.status === "success", "Invalid theme received");

  const { theme } = submission.value;

  const responseInit = {
    headers: {
      "set-cookie": setTheme(theme),
    },
  };

  return data({ result: submission.reply() }, responseInit);
};

export const ThemeSwitcher = () => {
  const fetcher = useFetcher<typeof action>({ key: "theme" });

  const [form] = useForm({
    id: "theme-switch",
    lastResult: fetcher.data?.result,
  });

  const optimisticMode = useOptimisticThemeMode();
  const {
    userPrefs: { theme: userPreferedTheme },
  } = useRequestInfo();

  const mode = optimisticMode ?? userPreferedTheme ?? "system";
  const nextMode =
    mode === "system" ? "light" : mode === "light" ? "dark" : "system";

  return (
    <fetcher.Form
      method="POST"
      action="/resources/theme-switch"
      {...getFormProps(form)}
    >
      <input type="hidden" name="theme" value={nextMode} />
      <button type="submit">{themeMap[nextMode]}</button>
    </fetcher.Form>
  );
};

export const useOptimisticThemeMode = () => {
  const fetcher = useFetcher({ key: "theme" });

  if (fetcher && fetcher.formData) {
    const submission = parseWithZod(fetcher.formData, {
      schema: ThemeFormSchema,
    });

    if (submission.status === "success") {
      return submission.value.theme;
    }
  }
};

export const useTheme = () => {
  const hints = useHints();
  const requestInfo = useRequestInfo();
  const optimisticMode = useOptimisticThemeMode();

  if (optimisticMode)
    return optimisticMode === "system" ? hints.theme : optimisticMode;

  return requestInfo.userPrefs.theme ?? hints.theme;
};

export const useOptionalTheme = () => {
  const optionalHitns = useOptionalHints();
  const optionalRequestInfo = useOptionalRequestInfo();
  const optimisticMode = useOptimisticThemeMode();
  if (optimisticMode) {
    return optimisticMode === "system" ? optionalHitns?.theme : optimisticMode;
  }

  return optionalRequestInfo?.userPrefs.theme ?? optionalHitns?.theme;
};
