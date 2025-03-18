import { type LinksFunction, type MetaFunction } from "react-router";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";

import { Header, Footer } from "#app/components/organisms";

import faviconAppleTouchIcon from "./assets/favicon/apple-touch-icon.png?url";
import faviconPng from "./assets/favicon/favicon-96x96.png?url";
import faviconIco from "./assets/favicon/favicon.ico?url";
import faviconSvg from "./assets/favicon/favicon.svg?url";
import webManifest from "./assets/favicon/site.webmanifest?url";

import fontStylesheet from "./styles/font.css?url";
import tailwindStylesheet from "./styles/tailwind.css?url";

import { getEnv } from "./utils/env.server";
import { GeneralErrorBoundary } from "./components/pages/error-boundary/error-boundary";

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

export const loader = () => {
  return {
    ENV: getEnv(),
  };
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex flex-col min-h-screen">
        <Header />
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

export const ErrorBoundary = () => <GeneralErrorBoundary />;
