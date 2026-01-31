import { useEffect, useCallback, useRef } from 'react';
import { ImprovedSpeechUtils } from './speechUtils';
import { useFocusEffect } from 'expo-router';

interface UseSpeechOptions {
  pageId?: string;
  autoCleanupOnUnmount?: boolean;
  autoStopOnBlur?: boolean;
}

export const useSpeech = (options: UseSpeechOptions = {}) => {
  const {
    pageId = `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    autoCleanupOnUnmount = true,
    autoStopOnBlur = true
  } = options;

  const pageIdRef = useRef(pageId);
  const isActiveRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null); // Thêm AbortController

  // Register page on mount
  useEffect(() => {
    const currentPageId = pageIdRef.current;
    ImprovedSpeechUtils.registerPage(currentPageId);
    ImprovedSpeechUtils.setActivePage(currentPageId);
    
    console.log(`🎣 useSpeech hook mounted for page: ${currentPageId}`);

    return () => {
      if (autoCleanupOnUnmount) {
        console.log(`🎣 useSpeech hook unmounting, cleaning up page: ${currentPageId}`);
        
        // Hủy bỏ mọi yêu cầu TTS đang xử lý
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          console.log(`🛑 Aborted all pending TTS requests for page: ${currentPageId}`);
        }
        
        ImprovedSpeechUtils.cleanup(currentPageId);
      }
    };
  }, [autoCleanupOnUnmount]);

  // Handle focus/blur events
  useFocusEffect(
    useCallback(() => {
      // Page focused
      isActiveRef.current = true;
      ImprovedSpeechUtils.setActivePage(pageIdRef.current);
      console.log(`🎯 Page focused: ${pageIdRef.current}`);

      return () => {
        // Page blurred
        isActiveRef.current = false;
        if (autoStopOnBlur) {
          console.log(`😴 Page blurred, stopping speech: ${pageIdRef.current}`);
          
          // Hủy bỏ mọi yêu cầu TTS khi blur
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            console.log(`🛑 Aborted TTS requests on blur: ${pageIdRef.current}`);
          }
          
          ImprovedSpeechUtils.stopSpeech();
        }
      };
    }, [autoStopOnBlur])
  );

  const speak = useCallback(async (text: string) => {
    if (!isActiveRef.current) {
      console.warn('⚠️ Cannot speak - page is not active');
      return;
    }
    
    // Hủy yêu cầu trước đó nếu có
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Tạo AbortController mới
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    try {
      // Truyền signal đến ImprovedSpeechUtils để hỗ trợ cancellation
      await ImprovedSpeechUtils.speakText(text, pageIdRef.current, signal);
    } catch (error) {
      if (signal.aborted) {
        console.log('🛑 Speech request was aborted');
        return; // Không xử lý lỗi nếu đã bị hủy
      }
      console.error('❌ Speech error:', error);
      throw error;
    }
  }, []);

  const stopSpeech = useCallback(async () => {
    // Hủy yêu cầu hiện tại khi dừng speech
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    await ImprovedSpeechUtils.stopSpeech();
  }, []);

  // ... các hàm khác giữ nguyên
  const clearCache = useCallback(async () => {
    await ImprovedSpeechUtils.clearCache();
  }, []);

  const getCacheInfo = useCallback(() => {
    return ImprovedSpeechUtils.getCacheInfo();
  }, []);

  const getDebugInfo = useCallback(() => {
    return ImprovedSpeechUtils.getDebugInfo();
  }, []);

  const isSpeechActive = useCallback(() => {
    return ImprovedSpeechUtils.isSpeechActive();
  }, []);

  return {
    speak,
    stopSpeech,
    clearCache,
    getCacheInfo,
    getDebugInfo,
    isSpeechActive,
    pageId: pageIdRef.current,
    isPageActive: isActiveRef.current
  };
};