export default async (req, context) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id || typeof id !== "string" || id.length !== 6) {
    return new Response(JSON.stringify({ error: "Invalid card ID" }), {
      status: 400,
      headers
    });
  }

  try {
    const siteId = process.env.SITE_ID;
    const token = process.env.NETLIFY_API_TOKEN;

    if (!siteId || !token) {
      return new Response(JSON.stringify({ error: "Server config missing" }), {
        status: 500,
        headers
      });
    }

    const blobUrl = `https://api.netlify.com/api/v1/blobs/${siteId}/cards/${id}`;

    const res = await fetch(blobUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (res.status === 404) {
      return new Response(JSON.stringify({ error: "Card not found" }), {
        status: 404,
        headers
      });
    }

    if (!res.ok) {
      throw new Error(`Blob fetch failed: ${res.status}`);
    }

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to fetch card", details: e.message }), {
      status: 500,
      headers
    });
  }
};
