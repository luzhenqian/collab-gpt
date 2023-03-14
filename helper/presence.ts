import { createPresence } from '@yomo/presence';

const currentConnectId = (
    Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000
).toString();

export const initPresence = async () => {
    const presencePromise = await createPresence({
        url: 'https://prscd2.allegro.earth/v1',
        publicKey: process.env.NEXT_PUBLIC_PRESENCE_PUBLIC_KEY,
        id: currentConnectId,
        appId: process.env.NEXT_PUBLIC_PRESENCE_APP_KEY,
    });

    console.log('presencePromise in creating');

    return { presencePromise };
};
