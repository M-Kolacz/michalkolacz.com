import * as cookie from "cookie";

const cookieHeaderName = "theme";
export type Theme = "light" | "dark";
const defaultTheme: Theme = "light";

export const getTheme = (request: Request): Theme => {
  const cookieHeader = request.headers.get("cookie");
  const parsed = cookieHeader
    ? cookie.parse(cookieHeader)[cookieHeaderName]
    : "light";

  if (parsed === "light" || parsed === "dark") return parsed;

  return defaultTheme;
};

export const setTheme = (theme: Theme) => {
  return cookie.serialize(cookieHeaderName, theme, {
    path: "/",
    maxAge: 31536000,
  });
};
