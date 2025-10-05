'use client';

import { useState } from 'react';

interface InlineEditProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  maxLength?: number;
}

export default function InlineEdit({ 
  value, 
  onSave, 
  placeholder = "Click to edit...", 
  multiline = false,
  className = "",
  maxLength = 200
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [loading, setLoading] = useState(false);

  const handleStartEdit = () => {
    setEditValue(value);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editValue.trim() === value.trim()) {
      setIsEditing(false);
      return;
    }

    if (!editValue.trim()) {
      alert("This field cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      await onSave(editValue.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={`relative ${className}`}>
        {multiline ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={3}
            className="w-full px-3 py-2 bg-white/10 border border-[#EAFE07] rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-[#EAFE07] resize-none"
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
            className="w-full px-3 py-2 bg-white/10 border border-[#EAFE07] rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-[#EAFE07]"
            autoFocus
          />
        )}
        
        {/* Action buttons */}
        <div className="flex items-center space-x-2 mt-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              loading 
                ? 'bg-gray-500 text-white cursor-not-allowed' 
                : 'bg-[#EAFE07] text-[#07173F] hover:bg-[#EAFE07]/80'
            }`}
          >
            {loading ? 'Saving...' : '✓ Save'}
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-3 py-1 bg-white/20 text-white rounded text-sm font-medium hover:bg-white/30 transition-colors"
          >
            ✕ Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`group cursor-pointer hover:bg-white/5 rounded-lg p-2 transition-colors ${className}`}
      onClick={handleStartEdit}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {multiline ? (
            <p className="text-white whitespace-pre-wrap">{value || placeholder}</p>
          ) : (
            <h1 className="text-4xl font-bold text-white">{value || placeholder}</h1>
          )}
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          <span className="text-[#EAFE07] text-sm">✏️</span>
        </div>
      </div>
    </div>
  );
}
