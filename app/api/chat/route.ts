import { openAIStream } from '@/helper/openAIStream';

export const config = {
    runtime: 'edge',
};
export async function POST(req: Request) {
    try {
        const { message } = await req.json();
        const stream = await openAIStream(message);
        return new Response(stream);
    } catch (e) {
        console.log(e);
        return new Response('Error', { status: 500 });
    }
}
