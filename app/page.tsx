'use client';
import { useState, useEffect } from 'react';
import { createPresence } from '@yomo/presence';
import { openAiRequest } from '@/helper/openAiRequest';
import { Loading } from '@/components/Loading';
import styles from './page.module.css';

type CompletedQuiz = {
    askerId: string;
    askerAvatar?: string;
    askContent: string;
    answererId: string;
    answererRole: string;
    answerContent: string;
    finishReason: string;
    remainedToken: number;
    totalToken: number;
};

export default function Home() {
    const [isShowLoading, setIsShowLoading] = useState<boolean>(false);
    const [channel, setChannel] = useState<any>(null);
    const [userInput, setUserInput] = useState<string>('');
    const [completedQuiz, setCompletedQuiz] = useState<CompletedQuiz[]>([]);

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
            'message',
            (message: { completedQuiz: CompletedQuiz[] }) => {
                setCompletedQuiz(message.completedQuiz);
            }
        );

        joinChannel?.subscribe(
            'loadingState',
            (message: { isLoading: boolean }) => {
                setIsShowLoading(message.isLoading);
            }
        );

        setChannel(joinChannel);
    };

    const sendToPresence = async () => {
        if (!userInput) return;

        channel?.broadcast('loadingState', { isLoading: true });
        setIsShowLoading(true);

        try {
            const returnedData = await openAiRequest(userInput);

            const oneCompletedQuiz: CompletedQuiz = {
                askerId: currentConnectId,
                askContent: userInput,
                answererId: returnedData.id,
                answererRole: returnedData.choices[0].message.role,
                answerContent: returnedData.choices[0].message.content,
                finishReason: returnedData.choices[0].finish_reason,
                remainedToken: returnedData.usage.completion_tokens,
                totalToken: returnedData.usage.total_tokens,
            };

            completedQuiz.push(oneCompletedQuiz);

            setCompletedQuiz(completedQuiz);
        } catch (error) {
            console.log(error);
            setIsShowLoading(false);
        }

        channel?.broadcast('message', { completedQuiz });
        channel?.broadcast('loadingState', { isLoading: false });
        setUserInput('');
        setIsShowLoading(false);
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
        <main className={styles.main}>
            <Loading isShow={isShowLoading} />

            <div className='flex flex-wrap items-center justify-center min-h-[50vh]'>
                <div className='w-full text-center text-gray-400 text-5xl sticky top-0 my-8'>
                    Presence real-time showcase
                </div>

                <div className='w-[75vw] h-[75vh] overflow-y-auto divide-y divide-gray-500'>
                    {completedQuiz.map((item) => {
                        return (
                            <div key={item.answererId}>
                                <div className='mb-4'>
                                    <span>{item.askContent}</span>
                                    <span className='float-right text-gray-400'>
                                        {item.remainedToken}/{item.totalToken}
                                    </span>
                                </div>
                                <div>
                                    <span>{item.answerContent}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className='absolute bottom-[5vh]'>
                    <input
                        className={styles.input}
                        placeholder='Write a message'
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                    />
                    <button className={styles.button} onClick={sendToPresence}>
                        Send
                    </button>
                </div>
            </div>
        </main>
    );
}
