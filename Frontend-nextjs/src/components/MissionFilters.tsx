'use client';

import { useState } from 'react';

export interface FilterOptions {
  sortBy: 'newest' | 'oldest' | 'mostLiked' | 'title';
  searchTerm: string;
  destination: 'all' | 'moon' | 'mars';
  status: 'all' | 'draft' | 'published' | 'archived';
}

interface MissionFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  showStatusFilter?: boolean;
  showDestinationFilter?: boolean;
}

export default function MissionFilters({ 
  filters, 
  onFiltersChange, 
  showStatusFilter = true,
  showDestinationFilter = true 
}: MissionFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      sortBy: 'newest',
      searchTerm: '',
      destination: 'all',
      status: 'all'
    });
  };

  const hasActiveFilters = filters.searchTerm || 
    filters.destination !== 'all' || 
    filters.status !== 'all' || 
    filters.sortBy !== 'newest';

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Filters & Sort</h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-[#EAFE07] hover:text-[#EAFE07]/80 text-sm font-medium"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[#EAFE07] hover:text-[#EAFE07]/80 text-sm font-medium"
          >
            {isExpanded ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search missions..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-[#EAFE07] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#EAFE07] focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="mostLiked">Most Liked</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>

            {/* Destination Filter */}
            {showDestinationFilter && (
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Destination
                </label>
                <select
                  value={filters.destination}
                  onChange={(e) => handleFilterChange('destination', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#EAFE07] focus:border-transparent"
                >
                  <option value="all">All Destinations</option>
                  <option value="moon">🌙 Moon</option>
                  <option value="mars">🔴 Mars</option>
                </select>
              </div>
            )}

            {/* Status Filter */}
            {showStatusFilter && (
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#EAFE07] focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
