export interface LikeRepository {
  // Dar like a una misión
  likeMission(userId: string, missionId: string): Promise<void>;
  
  // Quitar like de una misión
  unlikeMission(userId: string, missionId: string): Promise<void>;
  
  // Obtener el conteo de likes de una misión
  getLikesCount(missionId: string): Promise<number>;
  
  // Verificar si un usuario le dio like a una misión
  hasUserLiked(userId: string, missionId: string): Promise<boolean>;
  
  // Obtener likes de múltiples misiones
  getLikesForMissions(missionIds: string[]): Promise<{[missionId: string]: number}>;
  
  // Verificar likes de un usuario para múltiples misiones
  getUserLikesForMissions(userId: string, missionIds: string[]): Promise<{[missionId: string]: boolean}>;
}
