'use client';

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

export function useLikes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const likeMission = useCallback(async (missionId: string) => {
    if (!user) {
      throw new Error('User must be authenticated to like missions');
    }

    setLoading(true);
    setError(null);

    try {
      const { likeRepository } = await import('@/application/services/AppService');
      await likeRepository.likeMission(user.id, missionId);
    } catch (err) {
      // Si es un error de duplicado, significa que ya le dio like
      if (err instanceof Error && err.message.includes('duplicate key')) {
        console.log('User already liked this mission');
        return; // No lanzar error, solo salir silenciosamente
      }
      const errorMessage = err instanceof Error ? err.message : 'Failed to like mission';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const unlikeMission = useCallback(async (missionId: string) => {
    if (!user) {
      throw new Error('User must be authenticated to unlike missions');
    }

    setLoading(true);
    setError(null);

    try {
      const { likeRepository } = await import('@/application/services/AppService');
      await likeRepository.unlikeMission(user.id, missionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unlike mission';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const toggleLike = useCallback(async (missionId: string, isLiked: boolean) => {
    if (isLiked) {
      await unlikeMission(missionId);
    } else {
      await likeMission(missionId);
    }
  }, [likeMission, unlikeMission]);

  const toggleLikeSmart = useCallback(async (missionId: string) => {
    if (!user) {
      throw new Error('User must be authenticated to like missions');
    }

    console.log('toggleLikeSmart called for mission:', missionId, 'user:', user.id);
    setLoading(true);
    setError(null);

    try {
      const { likeRepository } = await import('@/application/services/AppService');
      
      // Intentar dar like primero, si falla por duplicado, entonces quitar like
      try {
        console.log('Attempting to like mission:', missionId);
        await likeRepository.likeMission(user.id, missionId);
        console.log('Successfully liked mission:', missionId);
        return true; // Se dio like exitosamente
      } catch (err) {
        console.log('Like failed, checking if duplicate:', err);
        // Si es error de duplicado, significa que ya le dio like, entonces quitar like
        if (err instanceof Error && err.message.includes('duplicate key')) {
          console.log('Duplicate like detected, removing like for mission:', missionId);
          await likeRepository.unlikeMission(user.id, missionId);
          console.log('Successfully unliked mission:', missionId);
          return false; // Se quitó el like
        }
        // Si es otro error, lanzarlo
        console.error('Unexpected error in like toggle:', err);
        throw err;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle like';
      console.error('Error in toggleLikeSmart:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    error,
    likeMission,
    unlikeMission,
    toggleLike,
    toggleLikeSmart,
  };
}
