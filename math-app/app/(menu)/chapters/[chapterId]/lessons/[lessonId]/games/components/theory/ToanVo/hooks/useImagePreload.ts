// src/hooks/useImagePreload.ts
import { useEffect, useState } from "react";
import { Asset } from "expo-asset";

export default function useImagePreload(imageModules: number[]) {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const loadAssets = async () => {
            try {
                await Asset.loadAsync(imageModules);
                setIsReady(true);
            } catch (error) {
                console.warn("Failed to preload images", error);
            }
        };

        loadAssets();
    }, [imageModules]);

    return isReady;
}
