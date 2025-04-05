import { useForm, getFormProps } from "@conform-to/react";
import { Link, useFetcher } from "react-router";

// eslint-disable-next-line boundaries/element-types
import { action, useOptimisticThemeMode } from "#app/root";
import { type Theme } from "#app/utils/theme.server.ts";

export const Header = ({
  userPreference,
}: {
  userPreference: Theme | null;
}) => {
  const fetcher = useFetcher<typeof action>({ key: "theme" });

  const [form] = useForm({
    id: "theme-switch",
    lastResult: fetcher.data?.result,
  });

  const optimisticMode = useOptimisticThemeMode();
  const mode = optimisticMode ?? userPreference ?? "system";
  const nextMode =
    mode === "system" ? "light" : mode === "light" ? "dark" : "system";

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-soft transition-colors duration-300">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold text-blue-800 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          Michal Kolacz
        </Link>
        <div className="flex items-center gap-6">
          <nav>
            <ul className="flex gap-6">
              <li>
                <Link
                  to="/blog"
                  className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </nav>
          <fetcher.Form method="POST" {...getFormProps(form)}>
            <input type="hidden" name="theme" value={nextMode} />

            <button type="submit">{themeMap[nextMode]}</button>
          </fetcher.Form>
        </div>
      </div>
    </header>
  );
};

const themeMap = {
  light: "🌞",
  dark: "🌚",
  system: "🖥️",
};
