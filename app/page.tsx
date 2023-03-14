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

        joinChannel?.subscribe('message', (message: CompletedQuiz[]) => {
            setCompletedQuiz(message);
        });

        setChannel(joinChannel);
    };

    const sendToPresence = async () => {
        if (!userInput) return;

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

        channel?.broadcast('message', completedQuiz);
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

    // const testData: CompletedQuiz[] = [
    //     {
    //         askerId: '57065',
    //         askContent: 'js typeError 错误处理',
    //         answererId: 'chatcmpl-6tu4sh4Z05mctQuHeL5ALW8EH',
    //         finishReason: 'stop',
    //         answererRole: 'assistant',
    //         answerContent:
    //             "\n\nTypeError是一种JavaScript错误类型，表示变量或属性的类型不是预期的类型。例如，当您尝试对数字和字符串进行操作时，可能会发生TypeError。此错误通常发生在以下几种情况下：\n\n1. 调用一个不存在的方法或函数\n2. 传递给函数的参数类型不正确\n3. 对null或undefined值调用方法或属性\n4. 尝试对非可变对象进行更改操作\n\n下面是一些处理TypeError错误的方法：\n\n1. 检查你的代码：仔细检查你的代码，确保所有的变量和属性都是正确的类型，避免使用不存在的方法或属性。\n\n2. 添加类型检查：尽可能在代码中添加类型检查，特别是在函数传递参数时。使用类型检查库，例如TypeScript或Flow，可以帮助您捕获这些类型错误。\n\n3. 使用try-catch语句：使用try-catch语句可以在运行时捕获TypeError错误，并提供错误消息或降级方案。例如：\n\n```javascript\ntry {\n  let result = someFunction();\n} catch (e) {\n  if (e instanceof TypeError) {\n    console.error('Type error: ' + e.message);\n    // handle the error\n  } else {\n    console.error('Unknown error: ' + e.message);\n    // handle the error\n  }\n}\n```\n\n4. 确保代码不依赖暂时不可用的值：避免对可能为null或undefined的值使用方法或属性。如果您的代码需要这些值，请先检查它们是否可用，或在代码中添加默认值。\n\n总之，TypeError错误通常是由于类型不匹配或使用不存在的方法或属性引起的。您可以通过添加类型检查，使用try-catch语句和检查您的代码来处理它们。",
    //         remainedToken: 459,
    //         totalToken: 473,
    //     },
    //     {
    //         askerId: '22324',
    //         askContent: 'js api 请求错误处理',
    //         answererId: 'chatcmpl-6tu4sh4Z05mctQuHF2n3eL5ALW8EH',
    //         finishReason: 'stop',
    //         answererRole: 'assistant',
    //         answerContent:
    //             "\n\nTypeError是一种JavaScript错误类型，表示变量或属性的类型不是预期的类型。例如，当您尝试对数字和字符串进行操作时，可能会发生TypeError。此错误通常发生在以下几种情况下：\n\n1. 调用一个不存在的方法或函数\n2. 传递给函数的参数类型不正确\n3. 对null或undefined值调用方法或属性\n4. 尝试对非可变对象进行更改操作\n\n下面是一些处理TypeError错误的方法：\n\n1. 检查你的代码：仔细检查你的代码，确保所有的变量和属性都是正确的类型，避免使用不存在的方法或属性。\n\n2. 添加类型检查：尽可能在代码中添加类型检查，特别是在函数传递参数时。使用类型检查库，例如TypeScript或Flow，可以帮助您捕获这些类型错误。\n\n3. 使用try-catch语句：使用try-catch语句可以在运行时捕获TypeError错误，并提供错误消息或降级方案。例如：\n\n```javascript\ntry {\n  let result = someFunction();\n} catch (e) {\n  if (e instanceof TypeError) {\n    console.error('Type error: ' + e.message);\n    // handle the error\n  } else {\n    console.error('Unknown error: ' + e.message);\n    // handle the error\n  }\n}\n```\n\n4. 确保代码不依赖暂时不可用的值：避免对可能为null或undefined的值使用方法或属性。如果您的代码需要这些值，请先检查它们是否可用，或在代码中添加默认值。\n\n总之，TypeError错误通常是由于类型不匹配或使用不存在的方法或属性引起的。您可以通过添加类型检查，使用try-catch语句和检查您的代码来处理它们。",
    //         remainedToken: 459,
    //         totalToken: 473,
    //     },
    //     {
    //         askerId: '22324',
    //         askContent: 'js api 请求错误处理',
    //         answererId: 'chatcmpl-6tu4sh4Z05mctQusdfF2n3eL5ALW8EH',
    //         finishReason: 'stop',
    //         answererRole: 'assistant',
    //         answerContent:
    //             "\n\nTypeError是一种JavaScript错误类型，表示变量或属性的类型不是预期的类型。例如，当您尝试对数字和字符串进行操作时，可能会发生TypeError。此错误通常发生在以下几种情况下：\n\n1. 调用一个不存在的方法或函数\n2. 传递给函数的参数类型不正确\n3. 对null或undefined值调用方法或属性\n4. 尝试对非可变对象进行更改操作\n\n下面是一些处理TypeError错误的方法：\n\n1. 检查你的代码：仔细检查你的代码，确保所有的变量和属性都是正确的类型，避免使用不存在的方法或属性。\n\n2. 添加类型检查：尽可能在代码中添加类型检查，特别是在函数传递参数时。使用类型检查库，例如TypeScript或Flow，可以帮助您捕获这些类型错误。\n\n3. 使用try-catch语句：使用try-catch语句可以在运行时捕获TypeError错误，并提供错误消息或降级方案。例如：\n\n```javascript\ntry {\n  let result = someFunction();\n} catch (e) {\n  if (e instanceof TypeError) {\n    console.error('Type error: ' + e.message);\n    // handle the error\n  } else {\n    console.error('Unknown error: ' + e.message);\n    // handle the error\n  }\n}\n```\n\n4. 确保代码不依赖暂时不可用的值：避免对可能为null或undefined的值使用方法或属性。如果您的代码需要这些值，请先检查它们是否可用，或在代码中添加默认值。\n\n总之，TypeError错误通常是由于类型不匹配或使用不存在的方法或属性引起的。您可以通过添加类型检查，使用try-catch语句和检查您的代码来处理它们。",
    //         remainedToken: 459,
    //         totalToken: 473,
    //     },
    //     {
    //         askerId: '22324',
    //         askContent: 'js api 请求错误处理',
    //         answererId: 'chatcmpl-6tu4sh4Z0sa5mctQuHF2n3eL5ALW8EH',
    //         finishReason: 'stop',
    //         answererRole: 'assistant',
    //         answerContent:
    //             "\n\nTypeError是一种JavaScript错误类型，表示变量或属性的类型不是预期的类型。例如，当您尝试对数字和字符串进行操作时，可能会发生TypeError。此错误通常发生在以下几种情况下：\n\n1. 调用一个不存在的方法或函数\n2. 传递给函数的参数类型不正确\n3. 对null或undefined值调用方法或属性\n4. 尝试对非可变对象进行更改操作\n\n下面是一些处理TypeError错误的方法：\n\n1. 检查你的代码：仔细检查你的代码，确保所有的变量和属性都是正确的类型，避免使用不存在的方法或属性。\n\n2. 添加类型检查：尽可能在代码中添加类型检查，特别是在函数传递参数时。使用类型检查库，例如TypeScript或Flow，可以帮助您捕获这些类型错误。\n\n3. 使用try-catch语句：使用try-catch语句可以在运行时捕获TypeError错误，并提供错误消息或降级方案。例如：\n\n```javascript\ntry {\n  let result = someFunction();\n} catch (e) {\n  if (e instanceof TypeError) {\n    console.error('Type error: ' + e.message);\n    // handle the error\n  } else {\n    console.error('Unknown error: ' + e.message);\n    // handle the error\n  }\n}\n```\n\n4. 确保代码不依赖暂时不可用的值：避免对可能为null或undefined的值使用方法或属性。如果您的代码需要这些值，请先检查它们是否可用，或在代码中添加默认值。\n\n总之，TypeError错误通常是由于类型不匹配或使用不存在的方法或属性引起的。您可以通过添加类型检查，使用try-catch语句和检查您的代码来处理它们。",
    //         remainedToken: 459,
    //         totalToken: 473,
    //     },
    //     {
    //         askerId: '22324',
    //         askContent: 'js api 请求错误处理',
    //         answererId: 'chatcmpl-6tu4sh4Z0sa5mcthQuHF2n3eL5ALW8EH',
    //         finishReason: 'stop',
    //         answererRole: 'assistant',
    //         answerContent:
    //             "\n\nTypeError是一种JavaScript错误类型，表示变量或属性的类型不是预期的类型。例如，当您尝试对数字和字符串进行操作时，可能会发生TypeError。此错误通常发生在以下几种情况下：\n\n1. 调用一个不存在的方法或函数\n2. 传递给函数的参数类型不正确\n3. 对null或undefined值调用方法或属性\n4. 尝试对非可变对象进行更改操作\n\n下面是一些处理TypeError错误的方法：\n\n1. 检查你的代码：仔细检查你的代码，确保所有的变量和属性都是正确的类型，避免使用不存在的方法或属性。\n\n2. 添加类型检查：尽可能在代码中添加类型检查，特别是在函数传递参数时。使用类型检查库，例如TypeScript或Flow，可以帮助您捕获这些类型错误。\n\n3. 使用try-catch语句：使用try-catch语句可以在运行时捕获TypeError错误，并提供错误消息或降级方案。例如：\n\n```javascript\ntry {\n  let result = someFunction();\n} catch (e) {\n  if (e instanceof TypeError) {\n    console.error('Type error: ' + e.message);\n    // handle the error\n  } else {\n    console.error('Unknown error: ' + e.message);\n    // handle the error\n  }\n}\n```\n\n4. 确保代码不依赖暂时不可用的值：避免对可能为null或undefined的值使用方法或属性。如果您的代码需要这些值，请先检查它们是否可用，或在代码中添加默认值。\n\n总之，TypeError错误通常是由于类型不匹配或使用不存在的方法或属性引起的。您可以通过添加类型检查，使用try-catch语句和检查您的代码来处理它们。",
    //         remainedToken: 459,
    //         totalToken: 473,
    //     },
    // ];

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
