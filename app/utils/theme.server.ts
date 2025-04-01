import * as cookie from "cookie";
import { z } from "zod";

const cookieHeaderName = "theme";
const defaultTheme = "light";
const themeSchema = z.enum(["light", "dark"]);

export const getTheme = (request: Request) => {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return defaultTheme;

  const theme = cookie.parse(cookieHeader)[cookieHeaderName];

  const { data = defaultTheme } = themeSchema.safeParse(theme);

  return data;
};

export const setTheme = async (request: Request) => {
  const formData = await request.formData();
  const nextTheme = formData.get("theme");

  const { data: theme = defaultTheme } = themeSchema.safeParse(nextTheme);

  const nextThemeCookie = cookie.serialize(cookieHeaderName, theme, {
    path: "/",
  });

  return nextThemeCookie;
};
