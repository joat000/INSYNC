import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const data = await req.json();
    const { id } = data;

    if (!id || typeof id !== "string" || id.length !== 6) {
      return new Response(JSON.stringify({ error: "Invalid card ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const store = getStore("cards");
    await store.setJSON(id, data);

    return new Response(JSON.stringify({ success: true, id }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to save card" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
