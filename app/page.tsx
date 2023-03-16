'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createPresence } from '@yomo/presence';
import { Loading } from '@/components/Loading';

export default function Home() {
    const [channel, setChannel] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [displayMessages, setDisplayMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState<string>('');
    const [loadingState, setLoadingState] = useState<boolean>(false);

    const currentConnectId = (
        Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000
    ).toString();

    const presenceConnect = async () => {
        const presence = await createPresence({
            url: 'https://prscd2.allegro.earth/v1',
            publicKey: process.env.NEXT_PUBLIC_PRESENCE_PUBLIC_KEY,
            id: currentConnectId,
            appId: process.env.NEXT_PUBLIC_PRESENCE_APP_KEY,
        });

        const joinChannel = presence.joinChannel(
            process.env.NEXT_PUBLIC_PRESENCE_CHANNEL_ID as string
        );

        joinChannel?.subscribe(
            'chatInfo',
            (message: { messages: Message[] }) => {
                setDisplayMessages(message.messages);
            }
        );

        joinChannel?.subscribe(
            'loadingState',
            (message: { isLoading: boolean }) => {
                setLoadingState(message.isLoading);
            }
        );

        setChannel(joinChannel);
    };

    const submitInput = async () => {
        if (!userInput) return;

        const updateMessages = [
            ...messages,
            { role: 'user' as const, content: userInput },
        ];

        setMessages(updateMessages);

        channel?.broadcast('chatInfo', {
            messages: updateMessages,
        });
        channel?.broadcast('loadingState', { isLoading: true });

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userInput }),
        });

        if (!response.ok) {
            channel?.broadcast('loadingState', { isLoading: false });
            return;
        }

        const data = response.body;

        if (!data) {
            channel?.broadcast('loadingState', { isLoading: false });
            return;
        }

        const reader = data.getReader();
        const decoder = new TextDecoder();

        let done = false;
        let isFirst = true;

        while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            const chunkValue = decoder.decode(value);

            if (isFirst) {
                isFirst = false;
                setMessages((messages) => [
                    ...messages,
                    { role: 'assistant', content: chunkValue },
                ]);
                channel?.broadcast('chatInfo', {
                    messages: [
                        ...messages,
                        { role: 'assistant', content: chunkValue },
                    ],
                });
            } else {
                setMessages((messages) => {
                    const lastMessage = messages[messages.length - 1];
                    const updatedMessage = {
                        ...lastMessage,
                        content: lastMessage.content + chunkValue,
                    };

                    channel?.broadcast('chatInfo', {
                        messages: [...messages.slice(0, -1), updatedMessage],
                    });

                    return [...messages.slice(0, -1), updatedMessage];
                });
            }
        }

        channel?.broadcast('loadingState', { isLoading: false });
    };

    useEffect(() => {
        if (window) {
            presenceConnect();
        }
        return () => {
            channel?.leave();
        };
    }, []);

    return (
        <main className='flex flex-col h-screen'>
            <div className='flex-1 overflow-auto'>
                <div className='w-full text-center text-gray-400 text-5xl sticky top-0 my-8'>
                    Presence real-time showcase
                </div>

                <div className='max-w-[800px] mx-auto'>
                    <div className='flex flex-col rounded-lg px-2 border-neutral-300'>
                        {displayMessages.map((message, index) => {
                            return (
                                <div
                                    key={index}
                                    className={`flex flex-col ${
                                        message.role === 'assistant'
                                            ? 'items-start'
                                            : 'items-end'
                                    }`}
                                >
                                    <div
                                        className={`flex items-center ${
                                            message.role === 'assistant'
                                                ? 'bg-neutral-200 text-neutral-900'
                                                : 'bg-blue-500 text-white'
                                        } rounded-2xl px-3 py-2 max-w-[67%] whitespace-pre-wrap`}
                                        style={{ overflowWrap: 'anywhere' }}
                                    >
                                        {message.content}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {loadingState && (
                        <div className='my-1 sm:my-1.5'>
                            <div className='flex flex-col flex-start'>
                                <div
                                    className='flex items-center bg-neutral-200 text-neutral-900 rounded-2xl px-4 py-2 w-fit'
                                    style={{
                                        overflowWrap: 'anywhere',
                                    }}
                                >
                                    <Loading isShow={loadingState} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className='relative'>
                        <textarea
                            className='min-h-[44px] rounded-lg pl-4 pr-12 py-2 w-full focus:outline-none focus:ring-1 focus:ring-neutral-300 border-2 border-neutral-200'
                            style={{ resize: 'none' }}
                            placeholder='Type a message...'
                            value={userInput}
                            rows={1}
                            onChange={(e) => {
                                setUserInput(e.target.value);
                            }}
                        />
                        <button onClick={submitInput} disabled={loadingState}>
                            <Image
                                src={'/arrow-up.svg'}
                                alt='send'
                                width={24}
                                height={24}
                                className='absolute right-2 bottom-3 h-8 w-8 hover:cursor-pointer rounded-full p-1 bg-blue-500 text-white hover:opacity-80'
                            />
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
