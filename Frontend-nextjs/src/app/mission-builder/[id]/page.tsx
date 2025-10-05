'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import MissionStatusSelector from '@/components/MissionStatusSelector';
import DeleteMissionModal from '@/components/DeleteMissionModal';
import InlineEdit from '@/components/InlineEdit';
import { useAuth } from '@/hooks/useAuth';
import { useMissions } from '@/hooks/useMissions';
import { Mission } from '@/domain/entities/Mission';

export default function MissionDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { publishMission, updateMissionStatus, deleteMission } = useMissions();
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; mission: Mission | null }>({ 
    isOpen: false, 
    mission: null 
  });

  useEffect(() => {
    const fetchMission = async () => {
      try {
        setLoading(true);
        const { missionRepository } = await import('@/application/services/AppService');
        const missionData = await missionRepository.findById(id as string);
        
        if (!missionData) {
          setError('Mission not found');
          return;
        }

        // Check if user can view this mission
        if (!missionData.isPublic && missionData.userId !== user?.id) {
          setError('You do not have permission to view this mission');
          return;
        }

        setMission(missionData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch mission');
      } finally {
        setLoading(false);
      }
    };

    if (id && user) {
      fetchMission();
    }
  }, [id, user]);

  const handlePublishMission = async () => {
    if (!mission) return;
    
    try {
      setPublishing(true);
      const updatedMission = await publishMission(mission.id);
      setMission(updatedMission);
      alert('Mission published successfully!');
    } catch (err) {
      console.error('Error publishing mission:', err);
      alert('Failed to publish mission. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  const handleStatusChange = async (missionId: string, newStatus: 'draft' | 'published' | 'archived'): Promise<Mission> => {
    if (!mission) throw new Error('Mission not found');
    
    try {
      await updateMissionStatus(missionId, newStatus);
      // Fetch updated mission
      const { missionRepository } = await import('@/application/services/AppService');
      const updatedMission = await missionRepository.findById(missionId);
      if (updatedMission) {
        setMission(updatedMission);
        return updatedMission;
      }
      return mission;
    } catch (err) {
      console.error('Error updating mission status:', err);
      alert('Failed to update mission status. Please try again.');
      return mission;
    }
  };

  const handleDeleteMission = () => {
    if (!mission) return;
    setDeleteModal({ isOpen: true, mission });
  };

  const handleConfirmDelete = async () => {
    if (!mission) return;
    
    try {
      await deleteMission(mission.id);
      router.push('/mission-builder');
    } catch (error) {
      console.error('Error deleting mission:', error);
      alert('Failed to delete mission. Please try again.');
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, mission: null });
  };

  const handleUpdateTitle = async (newTitle: string) => {
    if (!mission) return;
    try {
      const { missionRepository } = await import('@/application/services/AppService');
      const updatedMission = await missionRepository.update(mission.id, { title: newTitle });
      setMission(updatedMission);
    } catch (error) {
      console.error('Error updating title:', error);
      throw error;
    }
  };

  const handleUpdateDescription = async (newDescription: string) => {
    if (!mission) return;
    try {
      const { missionRepository } = await import('@/application/services/AppService');
      const updatedMission = await missionRepository.update(mission.id, { description: newDescription });
      setMission(updatedMission);
    } catch (error) {
      console.error('Error updating description:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="h-full text-white">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#EAFE07] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white">Loading mission...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !mission) {
    return (
      <ProtectedRoute>
        <div className="h-full text-white">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-4">Mission Not Found</h1>
              <p className="text-gray-400 mb-6">{error || 'This mission does not exist'}</p>
              <Link href="/mission-builder" className="bg-[#EAFE07] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#EAFE07]/80 transition-colors">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="h-full text-white">
        {/* Main Content */}
        <main className="pt-32 p-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Link href="/mission-builder" className="text-[#EAFE07] hover:text-[#EAFE07]/80 transition-colors mb-4 inline-block">
                ← Back to Dashboard
              </Link>
              
              {/* Editable Title */}
              {mission.userId === user?.id ? (
                <InlineEdit
                  value={mission.title}
                  onSave={handleUpdateTitle}
                  placeholder="Enter mission title..."
                  className="mb-4"
                />
              ) : (
                <div className="mb-4">
                  <h1 className="text-4xl font-bold text-white mb-2">{mission.title}</h1>
                  <p className="text-sm text-blue-300">Created by {mission.author?.name || 'Anonymous'}</p>
                </div>
              )}
              
              {/* Editable Description */}
              {mission.userId === user?.id ? (
                <InlineEdit
                  value={mission.description}
                  onSave={handleUpdateDescription}
                  placeholder="Enter mission description..."
                  multiline={true}
                  maxLength={500}
                />
              ) : (
                <div>
                  <p className="text-xl text-gray-400 mb-2">{mission.description}</p>
                  <p className="text-sm text-blue-300">This mission was created by another user and cannot be edited.</p>
                </div>
              )}
            </div>

            {/* Mission Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Mission Info */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Mission Details</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Destination:</span>
                    <span className="text-white font-semibold">{mission.destination.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Passengers:</span>
                    <span className="text-white font-semibold">{mission.passengers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white font-semibold">{mission.duration} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Status:</span>
                    {mission.userId === user?.id ? (
                      <MissionStatusSelector
                        currentStatus={mission.status}
                        missionId={mission.id}
                        onStatusChange={handleStatusChange}
                      />
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        mission.status === 'published' ? 'bg-green-500/20 text-green-300' :
                        mission.status === 'draft' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {mission.status}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Visibility:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      mission.isPublic ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                    }`}>
                      {mission.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Likes:</span>
                    <span className="text-white font-semibold flex items-center">
                      ❤️ {mission.likesCount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created:</span>
                    <span className="text-white font-semibold">
                      {new Date(mission.createdAt).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  {mission.author && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Author:</span>
                      <span className="text-white font-semibold">{mission.author.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 3D Preview Placeholder */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4">3D Preview</h2>
                <div className="h-64 bg-gradient-to-br from-[#0042A6]/30 to-[#07173F]/50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#EAFE07]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      {mission.destination === 'moon' && (
                        <span className="text-2xl">🌙</span>
                      )}
                      {mission.destination === 'mars' && (
                        <span className="text-2xl">🔴</span>
                      )}
                    </div>
                    <p className="text-gray-400">3D visualization coming soon</p>
                    <p className="text-sm text-blue-300 mt-2">Interactive 3D design tools will be available here</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              {/* 3D Design/View Buttons */}
              <Link 
                href={`/mission-builder/design?missionId=${mission.id}&mode=${mission.userId === user?.id ? 'edit' : 'view'}`}
                className="bg-[#EAFE07] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#EAFE07]/80 transition-colors"
              >
                {mission.userId === user?.id ? '🎨 Design in 3D' : '👁️ View in 3D'}
              </Link>
              
              {mission.userId === user?.id && (
                <>
                  <button 
                    onClick={handlePublishMission}
                    disabled={publishing || mission.status === 'published'}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                      mission.status === 'published' 
                        ? 'bg-green-500 text-white cursor-not-allowed' 
                        : publishing
                        ? 'bg-gray-500 text-white cursor-not-allowed'
                        : 'bg-gray-800 text-white hover:bg-gray-800/80'
                    }`}
                  >
                    {publishing ? 'Publishing...' : mission.status === 'published' ? 'Published' : 'Publish Mission'}
                  </button>
                  <button 
                    onClick={handleDeleteMission}
                    className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                  >
                    Delete Mission
                  </button>
                </>
              )}
              <Link 
                href="/mission-builder"
                className="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors"
              >
                Back to Dashboard
              </Link>
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
