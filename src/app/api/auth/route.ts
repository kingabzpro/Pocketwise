const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

export async function POST(request: Request) {
  if (!CONVEX_URL) {
    console.error("[auth] Missing NEXT_PUBLIC_CONVEX_URL");
    return new Response("Missing NEXT_PUBLIC_CONVEX_URL", { status: 500 });
  }

  const body = await request.text();
  const upstream = await fetch(`${CONVEX_URL}/api/auth`, {
    method: "POST",
    headers: {
      "Content-Type": request.headers.get("content-type") ?? "application/json",
      Cookie: request.headers.get("cookie") ?? "",
      Origin: request.headers.get("origin") ?? "",
    },
    body,
  });

  let responseBody = await upstream.text();
  if (!responseBody) {
    responseBody = JSON.stringify({
      error: `[auth] Empty response from Convex (status ${upstream.status})`,
    });
  }
  if (!upstream.ok) {
    console.error(
      `[auth] Upstream error ${upstream.status}: ${responseBody.slice(0, 500)}`
    );
  }
  const response = new Response(responseBody, {
    status: upstream.status,
    headers: {
      "content-type": "application/json",
    },
  });

  const setCookie = upstream.headers.get("set-cookie");
  if (setCookie) {
    response.headers.set("set-cookie", setCookie);
  }

  return response;
}
