import { getStore } from "@netlify/blobs";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default async (req, context) => {
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
    const store = getStore("cards");
    const data = await store.get(id, { type: "json" });

    if (!data) {
      return new Response(JSON.stringify({ error: "Card not found" }), {
        status: 404,
        headers
      });
    }

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
