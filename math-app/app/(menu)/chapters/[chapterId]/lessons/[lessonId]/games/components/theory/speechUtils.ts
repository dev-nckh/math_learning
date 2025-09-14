import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

// Custom AbortError class for React Native compatibility
class AbortError extends Error {
  constructor(message: string = 'Aborted') {
    super(message);
    this.name = 'AbortError';
  }
}

// Custom AbortController implementation for React Native compatibility
class CustomAbortController {
  public signal: CustomAbortSignal;
  
  constructor() {
    this.signal = new CustomAbortSignal();
  }
  
  abort(): void {
    this.signal._abort();
  }
}

// Custom AbortSignal implementation for React Native compatibility
class CustomAbortSignal {
  private _aborted = false;
  private _listeners: (() => void)[] = [];
  
  get aborted(): boolean {
    return this._aborted;
  }
  
  addEventListener(type: string, listener: () => void, options?: { once?: boolean }): void {
    if (type === 'abort') {
      this._listeners.push(listener);
      if (options?.once) {
        const originalListener = listener;
        const onceListener = () => {
          originalListener();
          this.removeEventListener('abort', onceListener);
        };
        this._listeners[this._listeners.length - 1] = onceListener;
      }
    }
  }
  
  removeEventListener(type: string, listener: () => void): void {
    if (type === 'abort') {
      const index = this._listeners.indexOf(listener);
      if (index > -1) {
        this._listeners.splice(index, 1);
      }
    }
  }
  
  _abort(): void {
    if (!this._aborted) {
      this._aborted = true;
      this._listeners.forEach(listener => {
        try {
          listener();
        } catch (error) {
          console.warn('Error in abort listener:', error);
        }
      });
    }
  }
}

export class ImprovedSpeechUtils {
    private static currentSound: Audio.Sound | null = null;
    private static audioCache = new Map<string, string>();
    private static cacheDirectory = FileSystem.cacheDirectory + 'tts-cache/';
    private static isSpeaking = false;
    private static activePage: string | null = null;
    private static registeredPages = new Set<string>();
    private static currentAbortController: AbortController | null = null; // Thêm AbortController

    private static readonly TTS_ENDPOINTS = [
        (text: string, lang: string) =>
        `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}&ttsspeed=0.5`,
        (text: string, lang: string) =>
        `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=gtx&q=${encodeURIComponent(text)}&ttsspeed=0.5`,
        (text: string, lang: string) =>
        `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=webapp&q=${encodeURIComponent(text)}&ttsspeed=0.5&total=1&idx=0`,
        (text: string, lang: string) =>
        `https://translate.google.com/translate_tts?tl=${lang}&q=${encodeURIComponent(text)}&client=tw-ob`,
    ];

    // Hàm hủy tất cả operations hiện tại
    public static abortCurrentOperations(): void {
        if (this.currentAbortController) {
            this.currentAbortController.abort();
            this.currentAbortController = null;
            console.log('🛑 All TTS operations aborted');
        }
        this.isSpeaking = false;
    }

    // Khởi tạo cache directory với abort check
    private static async initCacheDirectory(signal?: AbortSignal): Promise<void> {
        if (signal?.aborted) throw new AbortError('Aborted');
        
        const dirInfo = await FileSystem.getInfoAsync(this.cacheDirectory);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(this.cacheDirectory, { intermediates: true });
            console.log('📁 Created TTS cache directory');
        }
    }

    // Kiểm tra và lấy audio từ cache với abort check
    private static async getCachedAudio(textHash: string, signal?: AbortSignal): Promise<string | null> {
        if (signal?.aborted) throw new AbortError('Aborted');
        
        if (this.audioCache.has(textHash)) {
            const cachedPath = this.audioCache.get(textHash)!;
            const fileInfo = await FileSystem.getInfoAsync(cachedPath);
            
            if (fileInfo.exists) {
                console.log('💾 Using cached audio');
                return cachedPath;
            } else {
                this.audioCache.delete(textHash);
            }
        }
        return null;
    }

    // Lưu audio vào cache với abort check
    private static async saveToCache(textHash: string, sourceUri: string, signal?: AbortSignal): Promise<string> {
        if (signal?.aborted) throw new AbortError('Aborted');
        
        await this.initCacheDirectory(signal);
        const cachedPath = this.cacheDirectory + `${textHash}.mp3`;
        
        await FileSystem.copyAsync({
            from: sourceUri,
            to: cachedPath
        });
        
        this.audioCache.set(textHash, cachedPath);
        console.log('💾 Audio saved to cache');
        return cachedPath;
    }

    private static async downloadAndCacheAudio(url: string, textHash: string, signal?: AbortSignal): Promise<string> {
        if (signal?.aborted) throw new AbortError('Aborted');
        
        try {
            const tempUri = FileSystem.cacheDirectory + `tts-temp-${Date.now()}.mp3`;

            // ⬇️ Tải file audio với abort support
            const downloadRes = await FileSystem.downloadAsync(url, tempUri, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
                    Accept: 'audio/mpeg, audio/ogg, audio/*',
                    'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
                    Referer: 'https://translate.google.com/',
                },
            });

            if (signal?.aborted) {
                await FileSystem.deleteAsync(tempUri, { idempotent: true });
                throw new AbortError('Aborted');
            }

            // Lưu vào cache và xóa file tạm
            const cachedPath = await this.saveToCache(textHash, downloadRes.uri, signal);
            await FileSystem.deleteAsync(tempUri, { idempotent: true });
            
            return cachedPath;
        } catch (error: any) {
            if (error.name === 'AbortError') throw error;
            console.warn('❌ Error downloading audio:', error);
            throw error;
        }
    }

    private static async playAudioFromFile(filePath: string, signal?: AbortSignal): Promise<void> {
        if (signal?.aborted) throw new AbortError('Aborted');
        
        try {
            await this.stopCurrentSound();

            // ⚙️ Cấu hình chế độ âm thanh
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
            });

            if (signal?.aborted) throw new AbortError('Aborted');

            const { sound } = await Audio.Sound.createAsync(
                { uri: filePath },
                {
                    shouldPlay: true,
                    volume: 1.0,
                    rate: 1.0,
                    shouldCorrectPitch: true,
                }
            );

            if (signal?.aborted) {
                await sound.unloadAsync();
                throw new AbortError('Aborted');
            }

            this.currentSound = sound;

            return new Promise((resolve, reject) => {
                if (signal?.aborted) {
                    reject(new AbortError('Aborted'));
                    return;
                }

                const timeout = setTimeout(() => reject(new Error('⏱ Timeout playing audio')), 15000);

                // Thiết lập abort listener
                const onAbort = () => {
                    clearTimeout(timeout);
                    sound.unloadAsync().catch(() => {});
                    reject(new AbortError('Aborted'));
                };

                if (signal) {
                    signal.addEventListener('abort', onAbort, { once: true });
                }

                sound.setOnPlaybackStatusUpdate((status) => {
                    if (status.isLoaded) {
                        if (status.didJustFinish) {
                            clearTimeout(timeout);
                            if (signal) signal.removeEventListener('abort', onAbort);
                            this.currentSound = null;
                            resolve();
                        } else if ('error' in status && status.error) {
                            clearTimeout(timeout);
                            if (signal) signal.removeEventListener('abort', onAbort);
                            this.currentSound = null;
                            reject(new Error(`Playback error: ${status.error}`));
                        }
                    } else if ('error' in status && status.error) {
                        clearTimeout(timeout);
                        if (signal) signal.removeEventListener('abort', onAbort);
                        this.currentSound = null;
                        reject(new Error(`Load error: ${status.error}`));
                    }
                });
            });
        } catch (error: any) {
            this.currentSound = null;
            if (error.name === 'AbortError') throw error;
            console.warn('❌ Error playing audio from file:', error);
            throw error;
        }
    }

    private static async speakWithGoogleTTS(text: string, language: string = 'vi', signal?: AbortSignal): Promise<void> {
        if (signal?.aborted) throw new AbortError('Aborted');
        
        const textHash = this.generateTextHash(text, language);
        
        // Kiểm tra cache trước
        let audioPath = await this.getCachedAudio(textHash, signal);
        
        if (audioPath) {
            await this.playAudioFromFile(audioPath, signal);
            return;
        }

        // Nếu chưa có cache, tải từ Google TTS
        console.log('🌐 Downloading new audio from Google TTS');
        let lastError: Error | null = null;

        for (let endpointIndex = 0; endpointIndex < this.TTS_ENDPOINTS.length; endpointIndex++) {
            if (signal?.aborted) throw new AbortError('Aborted');
            
            const generateUrl = this.TTS_ENDPOINTS[endpointIndex];

            for (let attempt = 1; attempt <= 2; attempt++) {
                if (signal?.aborted) throw new AbortError('Aborted');
                
                try {
                    const url = generateUrl(text, language);
                    console.log(`🌐 Google TTS endpoint ${endpointIndex + 1}, attempt ${attempt}`);

                    audioPath = await this.downloadAndCacheAudio(url, textHash, signal);
                    await this.playAudioFromFile(audioPath, signal);

                    console.log(`✅ Success with Google TTS endpoint ${endpointIndex + 1}`);
                    return;
                } catch (error: any) {
                    if (error.name === 'AbortError') throw error;
                    lastError = error;
                    console.warn(`❌ Google endpoint ${endpointIndex + 1}, attempt ${attempt} failed:`, error.message);
                    if (attempt < 2) await new Promise((res) => setTimeout(res, 500));
                }
            }
        }

        throw new Error(`All Google TTS endpoints failed. Last error: ${lastError?.message || 'Unknown error'}`);
    }

    public static async stopSpeech(): Promise<void> {
        this.abortCurrentOperations();
        await this.stopCurrentSound();
        console.log('🛑 Speech stopped');
    }

    // Xóa cache
    public static async clearCache(): Promise<void> {
        try {
            const dirInfo = await FileSystem.getInfoAsync(this.cacheDirectory);
            if (dirInfo.exists) {
                await FileSystem.deleteAsync(this.cacheDirectory, { idempotent: true });
            }
            this.audioCache.clear();
            console.log('🗑️ TTS cache cleared');
        } catch (error) {
            console.warn('⚠️ Error clearing cache:', error);
        }
    }

    // Page management methods
    public static registerPage(pageId: string): void {
        this.registeredPages.add(pageId);
        console.log(`📄 Page registered: ${pageId}`);
    }

    public static setActivePage(pageId: string): void {
        if (this.registeredPages.has(pageId)) {
            this.activePage = pageId;
            console.log(`🎯 Active page set to: ${pageId}`);
        } else {
            console.warn(`⚠️ Trying to set unregistered page as active: ${pageId}`);
        }
    }

    public static cleanup(pageId: string): void {
        this.abortCurrentOperations(); // Hủy mọi operations khi cleanup
        this.registeredPages.delete(pageId);
        if (this.activePage === pageId) {
            this.activePage = null;
        }
        console.log(`🧹 Page cleaned up: ${pageId}`);
    }

    public static async speakText(text: string, pageId?: string, signal?: AbortSignal): Promise<void> {
        // Hủy operations hiện tại trước khi bắt đầu mới
        this.abortCurrentOperations();
        
        if (pageId && this.activePage !== pageId) {
            console.warn(`⚠️ Cannot speak - page ${pageId} is not active (current: ${this.activePage})`);
            return;
        }

        if (!text?.trim()) {
            console.warn('⚠️ No text to speak');
            return;
        }

        // Tạo AbortController mới nếu không có signal từ bên ngoài
        const internalAbortController = signal ? null : new AbortController();
        const effectiveSignal = signal || internalAbortController?.signal;
        this.currentAbortController = internalAbortController;

        try {
            const cleanText = this.cleanText(text);
            const chunks = this.splitTextIntoChunks(cleanText, 100);

            console.log(`🎤 Starting TTS for ${chunks.length} chunk(s)`);
            console.log(`📝 Preview: ${cleanText.substring(0, 100)}${cleanText.length > 100 ? '...' : ''}`);

            this.isSpeaking = true;

            for (let i = 0; i < chunks.length; i++) {
                if (effectiveSignal?.aborted) break;
                if (!this.isSpeaking) break;

                const chunk = chunks[i];
                await this.speakWithGoogleTTS(chunk, 'vi', effectiveSignal);

                if (i < chunks.length - 1) {
                    // Kiểm tra abort trong khi chờ
                    await new Promise<void>((res) => {
                        const timeout = setTimeout(res, 300);
                        if (effectiveSignal) {
                            effectiveSignal.addEventListener('abort', () => {
                                clearTimeout(timeout);
                                res();
                            }, { once: true });
                        }
                    });
                }
            }

            this.isSpeaking = false;
            console.log('✅ TTS completed successfully');
        } catch (error: any) {
            this.isSpeaking = false;
            if (error.name === 'AbortError') {
                console.log('🛑 TTS aborted');
            } else {
                console.error('❌ TTS error:', error);
                throw error;
            }
        } finally {
            if (internalAbortController) {
                this.currentAbortController = null;
            }
        }
    }

    public static isSpeechActive(): boolean {
        return this.isSpeaking;
    }

    public static getCacheInfo(): { cacheSize: number; cacheDirectory: string; cacheKeys: string[] } {
        return {
            cacheSize: this.audioCache.size,
            cacheDirectory: this.cacheDirectory,
            cacheKeys: Array.from(this.audioCache.keys())
        };
    }

    public static getDebugInfo(): { activePage: string | null; registeredPages: string[]; isSpeaking: boolean } {
        return {
            activePage: this.activePage,
            registeredPages: Array.from(this.registeredPages),
            isSpeaking: this.isSpeaking
        };
    }

    private static async stopCurrentSound(): Promise<void> {
        if (this.currentSound) {
            try {
                await this.currentSound.stopAsync();
                await this.currentSound.unloadAsync();
            } catch (error) {
                console.warn('⚠️ Error stopping sound:', error);
            } finally {
                this.currentSound = null;
            }
        }
    }

    private static cleanText(text: string): string {
        return text
            .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
            .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
            .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
            .replace(/[👋🔴✨📏🎨🎉🎯•👆↔️🏆━]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    private static splitTextIntoChunks(text: string, maxLength: number = 100): string[] {
        const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
        const chunks: string[] = [];
        let currentChunk = '';

        for (const sentence of sentences) {
            const trimmed = sentence.trim();
            if (currentChunk.length + trimmed.length > maxLength) {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                    currentChunk = trimmed;
                } else {
                    chunks.push(trimmed);
                }
            } else {
                currentChunk += (currentChunk ? '. ' : '') + trimmed;
            }
        }

        if (currentChunk) chunks.push(currentChunk.trim());
        return chunks.length > 0 ? chunks : [text];
    }

    private static generateTextHash(text: string, language: string): string {
        const content = `${text}-${language}`;
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(8, '0');
    }
}