import { openAIStream } from "@/helper/openAIStream";

export const config = {
  runtime: "edge",
};
export const POST = async (req: Request) => {
  try {
    const { message } = await req.json();
    const stream = await openAIStream(message);
    return new Response(stream);
  } catch (e) {
    console.log(req, " req");

    console.log(e);
    return new Response("Error", { status: 500 });
  }
};
