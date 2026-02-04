import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id || typeof id !== "string" || id.length !== 6) {
    return new Response(JSON.stringify({ error: "Invalid card ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const store = getStore("cards");
    const data = await store.get(id, { type: "json" });

    if (!data) {
      return new Response(JSON.stringify({ error: "Card not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to fetch card" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
