'use client';

import { useRef, useEffect, useState } from 'react';

export default function Page() {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        return () => {
            if (iframeRef.current) {
                iframeRef.current.src = 'about:blank';
            }
        };
    }, []);

    return (
        <div className="pt-16">
            <div className="max-w-6xl mx-auto px-6">
                <h1 className="text-4xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                    Ruin
                </h1>
                <p className="mt-2 text-xl text-gray-600 dark:text-gray-400">
                    Ruin is a split focus platformer I built that can be played with 1 or 2 people.
                </p>

                <div className="mt-8 mb-16 relative z-10">
                    {gameStarted ? (
                        <iframe
                            ref={iframeRef}
                            src="/game/unity.html"
                            width="1100"
                            height="650"
                            style={{ border: 'none' }}
                            allowFullScreen
                        />
                    ) : (
                        <div
                            className="flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black rounded-lg cursor-pointer"
                            style={{ width: '1100px', height: '650px' }}
                            onClick={() => setGameStarted(true)}
                        >
                            <div className="w-24 h-24 mb-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                <svg
                                    className="w-12 h-12 text-white ml-1"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                            <span className="text-lg font-medium text-white/80">
                                Click to Play
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}