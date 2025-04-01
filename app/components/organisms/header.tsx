import { Link, useFetcher } from "react-router";

export const Header = ({ theme }: { theme: "light" | "dark" }) => {
  const fetcher = useFetcher({ key: "theme" });

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
          <fetcher.Form method="POST">
            <input
              type="hidden"
              name="theme"
              value={theme === "light" ? "dark" : "light"}
            />

            <button type="submit">{themeMap[theme]}</button>
          </fetcher.Form>
        </div>
      </div>
    </header>
  );
};

const themeMap = {
  light: "🌚",
  dark: "🌞",
  system: "🖥️",
};
