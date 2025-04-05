import * as cookie from "cookie";

const cookieHeaderName = "theme";
export type Theme = "light" | "dark";
const defaultTheme: Theme = "light";

export const getTheme = (request: Request): Theme | null => {
  const cookieHeader = request.headers.get("cookie");
  const parsed = cookieHeader
    ? cookie.parse(cookieHeader)[cookieHeaderName]
    : defaultTheme;

  if (parsed === "light" || parsed === "dark") return parsed;

  return null;
};

export const setTheme = (theme: Theme | "system") => {
  return cookie.serialize(cookieHeaderName, theme, {
    path: "/",
    maxAge: 31536000,
  });
};
