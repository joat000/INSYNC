import { getStore } from "@netlify/blobs";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default async (req, context) => {
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

    const store = getStore("cards");
    await store.setJSON(id, data);

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
