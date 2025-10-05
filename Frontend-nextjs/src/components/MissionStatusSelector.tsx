'use client';

import { useState } from 'react';
import { Mission } from '@/domain/entities/Mission';

interface MissionStatusSelectorProps {
  currentStatus: 'draft' | 'published' | 'archived';
  missionId: string;
  onStatusChange: (missionId: string, newStatus: 'draft' | 'published' | 'archived') => Promise<Mission>;
  disabled?: boolean;
}

export default function MissionStatusSelector({ 
  currentStatus, 
  missionId, 
  onStatusChange, 
  disabled = false 
}: MissionStatusSelectorProps) {
  const [isChanging, setIsChanging] = useState(false);

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'bg-yellow-500/20 text-yellow-300' },
    { value: 'published', label: 'Published', color: 'bg-green-500/20 text-green-300' },
    { value: 'archived', label: 'Archived', color: 'bg-gray-500/20 text-gray-300' },
  ] as const;

  const handleStatusChange = async (newStatus: 'draft' | 'published' | 'archived') => {
    if (newStatus === currentStatus || isChanging) return;

    try {
      setIsChanging(true);
      await onStatusChange(missionId, newStatus);
    } catch (error) {
      console.error('Error changing mission status:', error);
      alert('Failed to change mission status. Please try again.');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="flex space-x-2">
      {statusOptions.map((option) => {
        const isActive = option.value === currentStatus;
        const isDisabled = disabled || isChanging;
        
        return (
          <button
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            disabled={isDisabled}
            className={`
              px-3 py-1 rounded-full text-xs font-semibold transition-all
              ${isActive 
                ? `${option.color} border border-current` 
                : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {isChanging && isActive ? 'Changing...' : option.label}
          </button>
        );
      })}
    </div>
  );
}
