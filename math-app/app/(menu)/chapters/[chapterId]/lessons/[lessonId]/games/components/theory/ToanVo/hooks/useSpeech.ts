import { useState, useEffect, useRef, useCallback } from "react";
import * as Speech from "expo-speech";

interface UseSpeechOptions {
    language?: string;
    pitch?: number;
    rate?: number;
    volume?: number;
}

export const useSpeech = (options: UseSpeechOptions = {}) => {
    const [speaking, setSpeaking] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Default speech options
    const defaultOptions: UseSpeechOptions = {
        language: "vi-VN",
        pitch: 1.0,
        rate: 1.0,
        volume: 1.0,
    };

    const speechOptions = { ...defaultOptions, ...options };

    // Speak function
    const speak = useCallback(
        async (text: string) => {
            if (speaking) {
                await stopSpeech();
            }

            setSpeaking(true);

            try {
                // Abort previous speech if any
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }

                abortControllerRef.current = new AbortController();
                const signal = abortControllerRef.current.signal;

                await Speech.speak(text, {
                    ...speechOptions,
                    onDone: () => setSpeaking(false),
                    onError: () => setSpeaking(false),
                });
            } catch (error) {
                console.error("Speech error:", error);
                setSpeaking(false);
            }
        },
        [speaking, speechOptions]
    );

    // Stop speech function
    const stopSpeech = useCallback(async () => {
        try {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            await Speech.stop();
            setSpeaking(false);
        } catch (error) {
            console.warn("Error stopping speech:", error);
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopSpeech();
        };
    }, [stopSpeech]);

    return {
        speak,
        stopSpeech,
        speaking,
    };
};