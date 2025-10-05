import { NextRequest, NextResponse } from 'next/server';
import { createMission, missionRepository } from '@/application/services/AppService';

export async function POST(request: NextRequest) {
  try {
    const { title, description, destination, passengers, duration, isPublic, isScientific, userId } = await request.json();

    if (!title || !destination || !passengers || !duration || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const mission = await createMission.execute({
      title,
      description,
      destination,
      passengers,
      duration,
      isPublic,
      isScientific: isScientific || false,
      status: 'draft',
      userId,
    });

    return NextResponse.json({
      success: true,
      mission: {
        id: mission.id,
        title: mission.title,
        description: mission.description,
        destination: mission.destination,
        passengers: mission.passengers,
        duration: mission.duration,
        isPublic: mission.isPublic,
        isScientific: mission.isScientific,
        status: mission.status,
        userId: mission.userId,
        createdAt: mission.createdAt,
        updatedAt: mission.updatedAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Mission creation failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const publicOnly = searchParams.get('public') === 'true';

    let missions;
    if (userId) {
      missions = await missionRepository.findByUserId(userId);
    } else if (publicOnly) {
      missions = await missionRepository.findPublic();
    } else {
      missions = await missionRepository.findPublic();
    }

    return NextResponse.json({
      success: true,
      missions: missions.map(mission => ({
        id: mission.id,
        title: mission.title,
        description: mission.description,
        destination: mission.destination,
        passengers: mission.passengers,
        duration: mission.duration,
        isPublic: mission.isPublic,
        isScientific: mission.isScientific,
        status: mission.status,
        userId: mission.userId,
        createdAt: mission.createdAt,
        updatedAt: mission.updatedAt,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch missions' },
      { status: 500 }
    );
  }
}
