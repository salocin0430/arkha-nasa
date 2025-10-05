'use client';

import { useState, useCallback } from 'react';
import { Mission } from '@/domain/entities/Mission';
import { FilterOptions } from '@/components/MissionFilters';

export function useMissionFilters() {
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'newest',
    searchTerm: '',
    destination: 'all',
    status: 'all'
  });

  const applyFilters = useCallback((missions: Mission[]): Mission[] => {
    let filtered = [...missions];

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(mission => 
        mission.title.toLowerCase().includes(searchLower) ||
        mission.description.toLowerCase().includes(searchLower) ||
        (mission.author?.name?.toLowerCase().includes(searchLower))
      );
    }

    // Apply destination filter
    if (filters.destination !== 'all') {
      filtered = filtered.filter(mission => mission.destination === filters.destination);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(mission => mission.status === filters.status);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'mostLiked':
          return (b.likesCount || 0) - (a.likesCount || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [filters]);

  const updateFilters = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      sortBy: 'newest',
      searchTerm: '',
      destination: 'all',
      status: 'all'
    });
  }, []);

  return {
    filters,
    applyFilters,
    updateFilters,
    clearFilters
  };
}
