function handlePreFlightRequest(): Response {
  return new Response("Preflight OK!", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "content-type",
    },
  });
}

async function handler(_req: Request): Promise<Response> {
  if (_req.method == "OPTIONS") {
    return handlePreFlightRequest();
  }

  const url = new URL(_req.url);

  const guess = decodeURIComponent(url.pathname.split('/').pop()) || "";
  console.log(`Received guess: ${url}`);
  const word = "Football";

  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  // Always allow CORS from this endpoint
  headers.append("Access-Control-Allow-Origin", "*");
  headers.append("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  const similarityRequestBody = JSON.stringify({
    word1: word,
    word2: guess,
  });

  const requestOptions: RequestInit = {
    method: "POST",
    headers: headers,
    body: similarityRequestBody,
    redirect: "follow",
  };

  try {
    const response = await fetch("https://word2vec.nicolasfley.fr/similarity", requestOptions);

    if (!response.ok) {
      console.error(`Error: ${response.statusText}`);
      return new Response(JSON.stringify({ error: response.statusText }), {
        status: response.status,
        headers: headers,
      });
    }

    const result = await response.json();

    console.log(result);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error("Fetch error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: headers,
    });
  }
}

Deno.serve(handler);