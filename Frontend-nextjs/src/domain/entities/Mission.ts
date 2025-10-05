export interface Mission {
  id: string;
  userId: string; // Referencia a auth.users(id)
  title: string;
  description: string;
  destination: 'moon' | 'mars';
  passengers: number;
  duration: number; // días
  isScientific: boolean;
  isPublic: boolean;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  // Author information (optional, only available in public missions)
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  // Like information
  likesCount?: number;
  isLikedByUser?: boolean;
}

export interface CreateMissionRequest {
  title: string;
  description: string;
  destination: 'moon' | 'mars';
  passengers: number;
  duration: number;
  isScientific: boolean;
  isPublic: boolean;
  status?: 'draft' | 'published' | 'archived';
  userId: string;
}

export interface UpdateMissionRequest {
  title?: string;
  description?: string;
  destination?: 'moon' | 'mars';
  passengers?: number;
  duration?: number;
  isScientific?: boolean;
  isPublic?: boolean;
  status?: 'draft' | 'published' | 'archived';
}