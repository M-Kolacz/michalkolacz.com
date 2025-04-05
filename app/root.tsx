import {
  type LinksFunction,
  type MetaFunction,
  type LoaderFunctionArgs,
} from "react-router";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";

import faviconAppleTouchIcon from "./assets/favicon/apple-touch-icon.png?url";
import faviconPng from "./assets/favicon/favicon-96x96.png?url";
import faviconIco from "./assets/favicon/favicon.ico?url";
import faviconSvg from "./assets/favicon/favicon.svg?url";
import webManifest from "./assets/favicon/site.webmanifest?url";
import { Header, Footer } from "./components/organisms";
import { GeneralErrorBoundary } from "./components/pages/error-boundary";
// eslint-disable-next-line boundaries/element-types
import { useOptionalTheme } from "./routes/resources+/theme-switch";
import fontStylesheet from "./styles/font.css?url";
import tailwindStylesheet from "./styles/tailwind.css?url";
import { ClientHintCheck, getHints } from "./utils/client-hints";
import { getEnv } from "./utils/env.server";
import { useNonce } from "./utils/nonce-provider";
import { getTheme } from "./utils/theme.server";

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
  return {
    ENV: getEnv(),
    requestInfo: {
      hints: getHints(request),
      userPrefs: {
        theme: getTheme(request),
      },
    },
  };
};

export function Layout({ children }: { children: React.ReactNode }) {
  const theme = useOptionalTheme() || "light";
  const nonce = useNonce();

  const { ENV } = useLoaderData<typeof loader>();

  const allowIndexing = ENV.ALLOW_INDEXING === "true";
  return (
    <html lang="en" className={`${theme} h-full overflow-x-hidden`}>
      <head>
        <ClientHintCheck nonce={nonce} />
        <Meta />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {allowIndexing ? null : (
          <meta name="robots" content="noindex, nofollow" />
        )}
        <Links />
      </head>
      <body className={`flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
        <ScrollRestoration
          getKey={(location) => location.pathname}
          nonce={nonce}
        />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const { ENV } = useLoaderData<typeof loader>();
  const nonce = useNonce();

  return (
    <>
      <Outlet />
      <script
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `window.ENV=${JSON.stringify(ENV)}`,
        }}
      />
    </>
  );
}

export const ErrorBoundary = () => <GeneralErrorBoundary />;
