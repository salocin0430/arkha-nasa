'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Pagination from '@/components/Pagination';
import MissionFilters from '@/components/MissionFilters';
import { useMissions } from '@/hooks/useMissions';
import { useLikes } from '@/hooks/useLikes';
import { useAuth } from '@/hooks/useAuth';
import { useMissionFilters } from '@/hooks/useMissionFilters';

export default function Gallery() {
  const { missions, loading, pagination, getPublicMissions, updateMission } = useMissions();
  const { toggleLikeSmart } = useLikes();
  const { user } = useAuth();
  const { filters, applyFilters, updateFilters } = useMissionFilters();
  const [userLikes, setUserLikes] = useState<{[missionId: string]: boolean}>({});
  const [likingMissions, setLikingMissions] = useState<{[missionId: string]: boolean}>({});

  useEffect(() => {
    getPublicMissions(1); // Start with page 1
  }, [getPublicMissions]);

  // Cargar el estado de likes del usuario cuando se cargan las misiones
  useEffect(() => {
    if (missions.length > 0 && user && !Object.keys(userLikes).length) {
      loadUserLikes();
    }
  }, [missions, user, userLikes]);

  const loadUserLikes = async () => {
    if (!user || missions.length === 0) return;
    
    try {
      const { likeRepository } = await import('@/application/services/AppService');
      const missionIds = missions.map(mission => mission.id);
      const userLikesData = await likeRepository.getUserLikesForMissions(user.id, missionIds);
      setUserLikes(userLikesData);
    } catch (error) {
      console.error('Error loading user likes:', error);
    }
  };

  const handlePageChange = (page: number) => {
    getPublicMissions(page);
  };

  const handleLike = async (missionId: string) => {
    if (!user) {
      console.log('No user authenticated, cannot like mission');
      return;
    }
    
    console.log('Attempting to like mission:', missionId, 'for user:', user.id);
    
    // Set loading state for this specific mission
    setLikingMissions(prev => ({
      ...prev,
      [missionId]: true
    }));
    
    try {
      const newLikedState = await toggleLikeSmart(missionId);
      console.log('Like toggle result:', newLikedState);
      
      // Update local state immediately for better UX
      setUserLikes(prev => ({
        ...prev,
        [missionId]: newLikedState
      }));
      
      // Update mission count locally without full reload
      const currentMission = missions.find(m => m.id === missionId);
      if (currentMission) {
        const newLikesCount = newLikedState 
          ? (currentMission.likesCount || 0) + 1 
          : Math.max((currentMission.likesCount || 0) - 1, 0);
        
        console.log('Updating mission likes count locally:', newLikesCount);
        
        // Update mission count using the hook's updateMission function
        updateMission(missionId, { likesCount: newLikesCount });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      // Clear loading state for this specific mission
      setLikingMissions(prev => ({
        ...prev,
        [missionId]: false
      }));
    }
  };
  return (
    <ProtectedRoute>
      <div className="h-full text-white">
        {/* Background Glow Effect - Removed for elegant black design */}

        {/* Main Content */}
        <main className="p-6 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Explore the Fleet</h1>
          <p className="text-xl text-gray-400">Discover habitats designed by other explorers</p>
        </div>
        
        {/* Filters */}
        <div className="max-w-6xl mx-auto">
          <MissionFilters
            filters={filters}
            onFiltersChange={updateFilters}
            showStatusFilter={false} // Gallery only shows published missions
            showDestinationFilter={true}
          />
        </div>

                {/* Mission Grid */}
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-2 border-[#EAFE07] border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-3 text-white">Loading missions...</span>
                  </div>
                ) : missions.length > 0 ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                      {applyFilters(missions).map((mission) => (
                      <div key={mission.id} className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden group hover:bg-white/15 transition-all duration-300 hover:scale-105">
                        {/* 3D Preview Section */}
                        <div className="h-40 relative overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
                          {/* Animated background pattern */}
                          <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-4 left-4 w-8 h-8 border border-[#EAFE07]/30 rounded-full animate-pulse"></div>
                            <div className="absolute top-8 right-6 w-4 h-4 bg-[#EAFE07]/20 rounded-full animate-pulse delay-300"></div>
                            <div className="absolute bottom-6 left-8 w-6 h-6 border border-[#EAFE07]/20 rounded-full animate-pulse delay-700"></div>
                            <div className="absolute bottom-4 right-4 w-3 h-3 bg-[#EAFE07]/30 rounded-full animate-pulse delay-1000"></div>
                          </div>
                          
                          {/* Mission icon based on destination */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-[#EAFE07]/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                              {mission.destination === 'moon' && (
                                <div className="w-8 h-8 bg-white/60 rounded-full flex items-center justify-center">
                                  <span className="text-black text-lg">🌙</span>
                                </div>
                              )}
                              {mission.destination === 'mars' && (
                                <div className="w-8 h-8 bg-red-500/60 rounded-full flex items-center justify-center">
                                  <span className="text-white text-lg">🔴</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Loading indicator */}
                          <div className="absolute bottom-2 right-2">
                            <div className="flex items-center space-x-1 text-xs text-white/60">
                              <div className="w-1 h-1 bg-[#EAFE07] rounded-full animate-pulse"></div>
                              <div className="w-1 h-1 bg-[#EAFE07] rounded-full animate-pulse delay-150"></div>
                              <div className="w-1 h-1 bg-[#EAFE07] rounded-full animate-pulse delay-300"></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Content Section */}
                        <div className="p-5">
                          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#EAFE07] transition-colors">{mission.title}</h3>
                          <p className="text-gray-400 text-sm mb-3">{mission.description}</p>
                          
                          {/* Mission stats */}
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="text-center bg-white/5 rounded-lg py-2">
                              <div className="text-xs text-gray-400">Passengers</div>
                              <div className="text-sm font-semibold text-white">{mission.passengers}</div>
                            </div>
                            <div className="text-center bg-white/5 rounded-lg py-2">
                              <div className="text-xs text-gray-400">Duration</div>
                              <div className="text-sm font-semibold text-white">{mission.duration}d</div>
                            </div>
                            <div className="text-center bg-white/5 rounded-lg py-2">
                              <div className="text-xs text-gray-400">Destination</div>
                              <div className="text-sm font-semibold text-white">{mission.destination.toUpperCase()}</div>
                            </div>
                          </div>
                          
                          {/* Author Information */}
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-[#EAFE07] rounded-full flex items-center justify-center text-black font-bold text-sm">
                              {mission.author?.name?.[0] || 'A'}
                            </div>
                            <div>
                              <div className="text-xs text-gray-400">Created by</div>
                              <div className="text-sm font-semibold text-white">{mission.author?.name || 'Anonymous'}</div>
                            </div>
                          </div>
                          
                          {/* Footer with status, likes and explore button */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                mission.status === 'published' ? 'bg-green-500/20 text-green-300' :
                                mission.status === 'draft' ? 'bg-yellow-500/20 text-yellow-300' :
                                'bg-gray-500/20 text-gray-300'
                              }`}>
                                {mission.status}
                              </span>
                              
                              {/* Like button */}
                              <button
                                onClick={() => handleLike(mission.id)}
                                disabled={likingMissions[mission.id]}
                                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 hover:scale-105 ${
                                  userLikes[mission.id] 
                                    ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' 
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                } ${likingMissions[mission.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <span className="text-sm">
                                  {likingMissions[mission.id] ? '⏳' : (userLikes[mission.id] ? '❤️' : '🤍')}
                                </span>
                                <span>{mission.likesCount || 0}</span>
                              </button>
                            </div>
                            
                            <Link 
                              href={`/mission-builder/${mission.id}`}
                              className="bg-[#EAFE07] text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#EAFE07]/80 transition-all duration-200 hover:scale-105"
                            >
                              Explore
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">No public missions available yet.</p>
                    <Link href="/mission-builder/new" className="bg-[#EAFE07] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#EAFE07]/80 transition-colors">
                      Create First Mission
                    </Link>
                  </div>
                )}
                
                {/* Pagination */}
                <div className="mt-8">
                  <div className="text-white text-center mb-4">
                    Debug: {missions.length} missions, Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                    loading={loading}
                  />
                </div>
              </main>
              </div>
            </ProtectedRoute>
          );
        }
