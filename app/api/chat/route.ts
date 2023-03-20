import { openAIStream } from "@/helper/openAIStream";

export const config = {
  runtime: "edge",
};
export default async (req: Request) => {
  console.log(req, " req");
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { message } = await req.json();
    const stream = await openAIStream(message);
    return new Response(stream);
  } catch (e) {
    console.log(e);
    return new Response("Error", { status: 500 });
  }
};
