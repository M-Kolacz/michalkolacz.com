import { type LoaderFunctionArgs } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const host =
    request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");

  try {
    await fetch(`${new URL(request.url).protocol}${host}`, {
      method: "HEAD",
      headers: { "X-Healthcheck": "true" },
    }).then((response) => {
      if (!response.ok) return Promise.reject(response);
    });
    return new Response("Ok");
  } catch (error: unknown) {
    console.error("🛑 Healthcheck", { error });
    return new Response("Error", { status: 500 });
  }
};
