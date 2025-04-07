import { createId as cuid } from "@paralleldrive/cuid2";
import { createCookieSessionStorage, redirect } from "react-router";
import { z } from "zod";

import { combineHeaders } from "#app/utils/misc";

const ToastSchema = z.object({
  description: z.string(),
  id: z.string().default(() => cuid()),
  title: z.string().optional(),
  type: z.enum(["message", "success", "error"]).default("message"),
});

export type Toast = z.infer<typeof ToastSchema>;
export type ToastInput = z.input<typeof ToastSchema>;

export const toastSessionStorage = createCookieSessionStorage<{ toast: Toast }>(
  {
    cookie: {
      name: "toast",
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      secrets: process.env.SESSION_SECRET.split(","),
    },
  }
);

export const createToastHeaders = async (toastInput: ToastInput) => {
  const toastSession = await toastSessionStorage.getSession();
  const toast = ToastSchema.parse(toastInput);
  toastSession.flash("toast", toast);

  return new Headers({
    "set-cookie": await toastSessionStorage.commitSession(toastSession),
  });
};

export const getToast = async (request: Request) => {
  const toastSession = await toastSessionStorage.getSession(
    request.headers.get("cookie")
  );
  const result = ToastSchema.safeParse(toastSession.get("toast"));
  const toast = result.success ? result.data : null;

  return {
    toast,
    toastHeaders: toast
      ? new Headers({
          "set-cookie": await toastSessionStorage.commitSession(toastSession),
        })
      : null,
  };
};

export const redirectWithToast = async (
  url: string,
  toast: ToastInput,
  init?: ResponseInit
) => {
  return redirect(url, {
    ...init,
    headers: combineHeaders(init?.headers, await createToastHeaders(toast)),
  });
};
