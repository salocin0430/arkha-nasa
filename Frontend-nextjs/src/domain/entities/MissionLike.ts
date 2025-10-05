export interface MissionLike {
  id: string;
  userId: string; // Referencia a auth.users(id)
  missionId: string; // Referencia a missions(id)
  createdAt: Date;
}

export interface CreateMissionLikeRequest {
  userId: string;
  missionId: string;
}
