import { MissionRepository } from '../repositories/MissionRepository';
import { ModuleRepository } from '../repositories/ModuleRepository';
import { CreateMissionRequest, Mission } from '../entities/Mission';

export class CreateMission {
  constructor(
    private missionRepository: MissionRepository,
    private moduleRepository: ModuleRepository
  ) {}

  async execute(request: CreateMissionRequest): Promise<Mission> {
    // Validaciones de negocio
    if (request.passengers < 1 || request.passengers > 300) {
      throw new Error('Number of passengers must be between 1 and 300');
    }

    if (request.duration < 1 || request.duration > 2000) {
      throw new Error('Mission duration must be between 1 and 2000 days');
    }

    if (!['moon', 'mars'].includes(request.destination)) {
      throw new Error('Invalid destination. Must be moon or mars');
    }

    // Crear la misión
    const mission = await this.missionRepository.create({
      userId: request.userId,
      title: request.title,
      description: request.description,
      destination: request.destination,
      passengers: request.passengers,
      duration: request.duration,
      isScientific: request.isScientific,
      isPublic: request.isPublic,
      status: request.status || 'draft',
    });

    return mission;
  }
}