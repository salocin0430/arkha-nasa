'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import MissionStatusSelector from '@/components/MissionStatusSelector';
import DeleteMissionModal from '@/components/DeleteMissionModal';
import Pagination from '@/components/Pagination';
import MissionFilters from '@/components/MissionFilters';
import { useAuth } from '@/hooks/useAuth';
import { useMissions } from '@/hooks/useMissions';
import { useMissionFilters } from '@/hooks/useMissionFilters';
import { Mission } from '@/domain/entities/Mission';

export default function Profile() {
  const { user } = useAuth();
  const { missions, loading, pagination, getUserMissions, updateMissionStatus, deleteMission } = useMissions();
  const { filters, applyFilters, updateFilters } = useMissionFilters();
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; mission: Mission | null }>({ 
    isOpen: false, 
    mission: null 
  });
  const [userStats, setUserStats] = useState({
    totalMissions: 0,
    totalLikes: 0
  });

  console.log('Profile: Component rendered, user:', user?.id, 'missions:', missions.length);

  useEffect(() => {
    if (user?.id) {
      console.log('Profile: Loading missions for user:', user.id);
      getUserMissions(1); // Start with page 1
      loadUserStats();
    }
  }, [user?.id, getUserMissions]); // Incluir getUserMissions en las dependencias

  const loadUserStats = async () => {
    if (!user?.id) return;
    
    try {
      // Obtener todas las misiones del usuario para contar el total real
      const { missionRepository } = await import('@/application/services/AppService');
      const allUserMissions = await missionRepository.findByUserId(user.id);
      const totalMissions = allUserMissions.length;
      
      // Obtener el total de likes que ha recibido el usuario
      const { likeRepository } = await import('@/application/services/AppService');
      const missionIds = allUserMissions.map(mission => mission.id);
      
      let totalLikes = 0;
      if (missionIds.length > 0) {
        const likesData = await likeRepository.getLikesForMissions(missionIds);
        totalLikes = Object.values(likesData).reduce((sum, count) => sum + count, 0);
      }
      
      setUserStats({
        totalMissions,
        totalLikes
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const publicMissions = missions.filter(mission => mission.isPublic);

  const handleDeleteMission = (mission: Mission) => {
    setDeleteModal({ isOpen: true, mission });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.mission) return;
    
    try {
      await deleteMission(deleteModal.mission.id);
      setDeleteModal({ isOpen: false, mission: null });
    } catch (error) {
      console.error('Error deleting mission:', error);
      alert('Failed to delete mission. Please try again.');
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, mission: null });
  };

  const handlePageChange = (page: number) => {
    getUserMissions(page);
  };
  return (
    <ProtectedRoute>
      <div className="h-full text-white">
        {/* Main Content */}
        <main className="p-6 relative z-10">
        <div className="max-w-5xl mx-auto">
                  {/* Profile Header */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-8 flex items-center space-x-6">
                    <div className="w-24 h-24 bg-[#EAFE07] rounded-full flex items-center justify-center text-4xl font-bold text-black">
                      {user?.user_metadata?.name?.[0] || user?.email?.[0] || 'U'}
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-1">{user?.user_metadata?.name || 'Explorer'}</h1>
                      <p className="text-gray-400 mb-4">{user?.email}</p>
                      <div className="flex space-x-8 text-sm">
                        <div className="text-center">
                          <div className="text-xl font-bold text-[#EAFE07]">{userStats.totalMissions}</div>
                          <div className="text-gray-400">Missions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-[#EAFE07]">{userStats.totalLikes}</div>
                          <div className="text-gray-400">Likes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-400">Member since</div>
                          <div className="text-lg font-semibold text-white">
                            {user?.created_at 
                              ? new Date(user.created_at).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })
                              : 'Unknown'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

          {/* My Missions */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">My Missions</h2>
            
            {/* Filters */}
            <div className="max-w-6xl mx-auto">
              <MissionFilters
                filters={filters}
                onFiltersChange={updateFilters}
                showStatusFilter={true}
                showDestinationFilter={true}
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-[#EAFE07] border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-white">Loading missions...</span>
              </div>
                    ) : missions.length > 0 ? (
                      <div className="space-y-4">
                        {applyFilters(missions).map((mission) => (
                          <div key={mission.id} className="bg-white/5 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white mb-2">{mission.title}</h3>
                                <p className="text-gray-400 text-sm mb-3">{mission.description}</p>
                                <div className="flex items-center space-x-4 text-xs text-gray-400">
                                  <span>{mission.passengers} passengers</span>
                                  <span>{mission.duration} days</span>
                                  <span>{mission.destination.toUpperCase()}</span>
                                </div>
                                
                                {/* Likes and Date */}
                                <div className="flex items-center justify-between text-xs mt-2">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-[#EAFE07]">❤️ {mission.likesCount || 0} likes</span>
                                  </div>
                                  <div className="text-gray-400">
                                    Created: {new Date(mission.createdAt).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  mission.isPublic 
                                    ? 'bg-green-500/20 text-green-300' 
                                    : 'bg-gray-500/20 text-gray-300'
                                }`}>
                                  {mission.isPublic ? 'Public' : 'Private'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Status Selector */}
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-3">
                                <span className="text-sm text-gray-400">Status:</span>
                                <MissionStatusSelector
                                  currentStatus={mission.status}
                                  missionId={mission.id}
                                  onStatusChange={updateMissionStatus}
                                />
                              </div>
                              
                              <div className="flex space-x-2">
                                <Link 
                                  href={`/mission-builder/${mission.id}`}
                                  className="bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-800 transition-colors"
                                >
                                  View
                                </Link>
                                <button
                                  onClick={() => handleDeleteMission(mission)}
                                  className="bg-red-500/80 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No missions yet. Create your first space habitat!</p>
                <Link href="/mission-builder/new" className="bg-[#EAFE07] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#EAFE07]/80 transition-colors">
                  Create Mission
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
          </div>
                </div>
              </main>
              
              {/* Delete Confirmation Modal */}
              <DeleteMissionModal
                isOpen={deleteModal.isOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                missionTitle={deleteModal.mission?.title || ''}
              />
              </div>
            </ProtectedRoute>
          );
        }
