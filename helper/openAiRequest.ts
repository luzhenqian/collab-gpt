export const openAiRequest = async (content: string) => {
    try {
        const request = fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'user',
                        content,
                    },
                ],
            }),
        });

        const response = await request;
        const data = response.json();

        return data;
    } catch (error) {
        return error;
    }
};
