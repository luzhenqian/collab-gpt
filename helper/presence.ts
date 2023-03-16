import { useState } from 'react';
import { createPresence } from '@yomo/presence';

const currentConnectId = (
    Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000
).toString();

export const PresenceConnect = async () => {
    const [completedQuiz, setCompletedQuiz] = useState<CompletedQuiz[]>([]);
    const [loadingState, setLoadingState] = useState<boolean>(false);

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
            setLoadingState(message.isLoading);
        }
    );

    return { joinChannel, completedQuiz, loadingState };
};
