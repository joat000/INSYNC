export default async (req, context) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers
    });
  }

  try {
    const data = await req.json();
    const { id } = data;

    if (!id || typeof id !== "string" || id.length !== 6) {
      return new Response(JSON.stringify({ error: "Invalid card ID" }), {
        status: 400,
        headers
      });
    }

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
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      throw new Error(`Blob save failed: ${res.status}`);
    }

    return new Response(JSON.stringify({ success: true, id }), {
      status: 200,
      headers
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to save card", details: e.message }), {
      status: 500,
      headers
    });
  }
};
