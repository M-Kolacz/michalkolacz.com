import { parseWithZod } from "@conform-to/zod";
import {
  type LinksFunction,
  type MetaFunction,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  useFetcher,
  data,
} from "react-router";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import { z } from "zod";

import { Header, Footer } from "#app/components/organisms";

import faviconAppleTouchIcon from "./assets/favicon/apple-touch-icon.png?url";
import faviconPng from "./assets/favicon/favicon-96x96.png?url";
import faviconIco from "./assets/favicon/favicon.ico?url";
import faviconSvg from "./assets/favicon/favicon.svg?url";
import webManifest from "./assets/favicon/site.webmanifest?url";
import { GeneralErrorBoundary } from "./components/pages/error-boundary/error-boundary";
import fontStylesheet from "./styles/font.css?url";
import tailwindStylesheet from "./styles/tailwind.css?url";
import { getEnv } from "./utils/env.server";
import { invariantResponse } from "./utils/invariant";
import { getTheme, setTheme } from "./utils/theme.server";

export const meta: MetaFunction = () => [
  { name: "apple-mobile-web-app-title", content: "michalkolacz.com" },
];

export const links: LinksFunction = () => [
  // --- Icons
  {
    rel: "icon",
    type: "image/png",
    href: faviconPng,
    sizes: "96x96",
  },
  { rel: "icon", type: "image/svg+xml", href: faviconSvg },
  { rel: "shortcut icon", href: faviconIco },
  { rel: "apple-touch-icon", sizes: "180x180", href: faviconAppleTouchIcon },
  { rel: "manifest", href: webManifest },
  // ---
  { rel: "stylesheet", href: fontStylesheet },
  { rel: "stylesheet", href: tailwindStylesheet },
];

export const loader = ({ request }: LoaderFunctionArgs) => {
  const theme = getTheme(request);

  return {
    ENV: getEnv(),
    theme: theme,
  };
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const ThemeFormSchema = z.object({
  theme: z.enum(["light", "dark"]),
  // // this is useful for progressive enhancement
  // redirectTo: z.string().optional(),
});

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

export function Layout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body
        className={`flex flex-col min-h-screen ${
          theme === "dark" ? "dark" : ""
        }`}
      >
        <Header theme={theme} />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
        <ScrollRestoration getKey={(location) => location.pathname} />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { ENV } = useLoaderData<typeof loader>();

  return (
    <>
      <Outlet />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.ENV=${JSON.stringify(ENV)}`,
        }}
      />
    </>
  );
}

const useOptimisticThemeMode = () => {
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

const useTheme = () => {
  const { theme } = useLoaderData<typeof loader>();
  const optimisticMode = useOptimisticThemeMode();

  if (optimisticMode) return optimisticMode;

  return theme;
};

export const ErrorBoundary = () => <GeneralErrorBoundary />;
