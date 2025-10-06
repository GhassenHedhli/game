import { useEffect, useCallback, useRef } from 'react';

declare global {
  interface Window {
    GamePix: {
      game: {
        gameLoading: (percentage: number) => void;
        gameLoaded: (callback: () => void) => void;
        customLoading: (show: boolean) => void;
        ping: (event: string, data: { score: number; level: string; achievements?: object }) => void;
        updateScore: (score: number) => void;
        updateLevel: (level: number) => void;
        happyMoment: () => void;
        setItem: (key: string, value: string) => void;
        getItem: (key: string) => string | null;
      };
      showInterstitial: () => void;
      showRewardAd: () => void;
      interstitialEnded: () => boolean;
      checkReward: () => boolean;
      lang: () => string;
    };
  }
}

export const useGamePix = () => {
  const isGamePixAvailable = useRef(typeof window !== 'undefined' && typeof window.GamePix !== 'undefined');
  const gameLoadedCalled = useRef(false);

  useEffect(() => {
    if (isGamePixAvailable.current) {
      console.log('GamePix SDK loaded successfully');
    } else {
      console.log('GamePix SDK not available - running in standalone mode');
    }
  }, []);

  const reportLoadingProgress = useCallback((percentage: number) => {
    if (isGamePixAvailable.current) {
      try {
        window.GamePix.game.gameLoading(percentage);
      } catch (error) {
        console.error('GamePix loading progress error:', error);
      }
    }
  }, []);

  const notifyGameLoaded = useCallback((callback: () => void) => {
    if (isGamePixAvailable.current && !gameLoadedCalled.current) {
      try {
        window.GamePix.game.gameLoaded(() => {
          console.log('GamePix: Game ready to start');
          callback();
        });
        gameLoadedCalled.current = true;
      } catch (error) {
        console.error('GamePix game loaded error:', error);
        callback(); // Call callback anyway
      }
    } else {
      callback(); // Call callback immediately if SDK not available
    }
  }, []);

  const showCustomLoading = useCallback((show: boolean) => {
    if (isGamePixAvailable.current) {
      try {
        window.GamePix.game.customLoading(show);
      } catch (error) {
        console.error('GamePix custom loading error:', error);
      }
    }
  }, []);

  const trackEvent = useCallback((event: 'level_complete' | 'game_over', data: { score: number; level: string | number; achievements?: object }) => {
    if (isGamePixAvailable.current) {
      try {
        const levelStr = typeof data.level === 'number' ? `level-${data.level}` : data.level;
        window.GamePix.game.ping(event, {
          score: data.score,
          level: levelStr,
          achievements: data.achievements || {}
        });
        console.log(`GamePix: Event tracked - ${event}`, data);
      } catch (error) {
        console.error('GamePix ping error:', error);
      }
    }
  }, []);

  const updateScore = useCallback((score: number) => {
    if (isGamePixAvailable.current) {
      try {
        window.GamePix.game.updateScore(score);
      } catch (error) {
        console.error('GamePix update score error:', error);
      }
    }
  }, []);

  const updateLevel = useCallback((level: number) => {
    if (isGamePixAvailable.current) {
      try {
        window.GamePix.game.updateLevel(level);
      } catch (error) {
        console.error('GamePix update level error:', error);
      }
    }
  }, []);

  const triggerHappyMoment = useCallback(() => {
    if (isGamePixAvailable.current) {
      try {
        window.GamePix.game.happyMoment();
      } catch (error) {
        console.error('GamePix happy moment error:', error);
      }
    }
  }, []);

  const showInterstitialAd = useCallback((onAdComplete?: () => void) => {
    if (isGamePixAvailable.current) {
      try {
        window.GamePix.showInterstitial();
        console.log('GamePix: Showing interstitial ad');
        
        // Check if ad ended (simplified polling approach)
        const checkAdEnded = setInterval(() => {
          if (window.GamePix.interstitialEnded()) {
            clearInterval(checkAdEnded);
            console.log('GamePix: Interstitial ad ended');
            if (onAdComplete) onAdComplete();
          }
        }, 100);
        
        // Fallback timeout
        setTimeout(() => {
          clearInterval(checkAdEnded);
          if (onAdComplete) onAdComplete();
        }, 30000); // 30 second max
      } catch (error) {
        console.error('GamePix interstitial error:', error);
        if (onAdComplete) onAdComplete();
      }
    } else {
      if (onAdComplete) onAdComplete();
    }
  }, []);

  const showRewardAd = useCallback((onRewarded?: () => void, onAdComplete?: () => void) => {
    if (isGamePixAvailable.current) {
      try {
        window.GamePix.showRewardAd();
        console.log('GamePix: Showing reward ad');
        
        // Check if player should be rewarded
        const checkReward = setInterval(() => {
          if (window.GamePix.checkReward()) {
            clearInterval(checkReward);
            console.log('GamePix: Player earned reward');
            if (onRewarded) onRewarded();
            if (onAdComplete) onAdComplete();
          }
        }, 100);
        
        // Fallback timeout
        setTimeout(() => {
          clearInterval(checkReward);
          if (onAdComplete) onAdComplete();
        }, 30000); // 30 second max
      } catch (error) {
        console.error('GamePix reward ad error:', error);
        if (onAdComplete) onAdComplete();
      }
    } else {
      // In standalone mode, always give reward
      if (onRewarded) onRewarded();
      if (onAdComplete) onAdComplete();
    }
  }, []);

  const saveData = useCallback((key: string, data: any) => {
    if (isGamePixAvailable.current) {
      try {
        window.GamePix.game.setItem(key, JSON.stringify(data));
        console.log('GamePix: Data saved to cloud');
      } catch (error) {
        console.error('GamePix save error:', error);
      }
    }
  }, []);

  const loadData = useCallback((key: string) => {
    if (isGamePixAvailable.current) {
      try {
        const data = window.GamePix.game.getItem(key);
        if (data) {
          console.log('GamePix: Data loaded from cloud');
          return JSON.parse(data);
        }
      } catch (error) {
        console.error('GamePix load error:', error);
      }
    }
    return null;
  }, []);

  const getLanguage = useCallback(() => {
    if (isGamePixAvailable.current) {
      try {
        return window.GamePix.lang();
      } catch (error) {
        console.error('GamePix language error:', error);
      }
    }
    return 'en';
  }, []);

  return {
    isGamePixAvailable: isGamePixAvailable.current,
    reportLoadingProgress,
    notifyGameLoaded,
    showCustomLoading,
    trackEvent,
    updateScore,
    updateLevel,
    triggerHappyMoment,
    showInterstitialAd,
    showRewardAd,
    saveData,
    loadData,
    getLanguage
  };
};
