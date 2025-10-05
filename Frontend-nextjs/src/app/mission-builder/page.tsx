'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useMissions } from '@/hooks/useMissions';

// A simple card component for the main dashboard
const DashboardCard = ({ title, description, href }: { title: string; description: string; href: string }) => (
    <Link href={href}>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center h-full flex flex-col justify-center items-center hover:bg-white/20 transition-all cursor-pointer">
            <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
        </div>
    </Link>
);


export default function MissionDashboard() {
    const { user } = useAuth();
    const { missions, loading, getUserMissions } = useMissions();

  useEffect(() => {
    if (user?.id) {
      console.log('Dashboard: Loading missions for user:', user.id);
      getUserMissions();
    }
  }, [user?.id, getUserMissions]); // Incluir getUserMissions en las dependencias

    return (
        <ProtectedRoute>
            <div className="h-full text-white">
                {/* Main Content */}
                        <main className="p-6 relative z-10">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold text-white mb-4">Hello {user?.user_metadata?.name || 'Explorer'}</h1>
                        <p className="text-xl text-gray-400">Welcome to your mission dashboard</p>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-10">
                        <DashboardCard
                            title="Design Your Arkha"
                            description="Create your own adaptive habitat. Set mission time and crew size, and watch your space home come to life in 3D."
                            href="/mission-builder/new"
                        />
                        <DashboardCard
                            title="My Missions"
                            description="Revisit and refine the habitats you've already designed. Your personal journey through space architecture."
                            href="/profile"
                        />
                        <DashboardCard
                            title="Explore the Fleet"
                            description="Discover habitats designed by other explorers. Learn, compare, and get inspired by the community."
                            href="/gallery"
                        />
                        <DashboardCard
                            title="NASA Archives"
                            description="Dive into real NASA research on extraterrestrial habitats. Learn how science shapes the future of living in space."
                            href="/archives"
                        />
                    </div>

                    {/* Recent Missions */}
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-2xl font-bold text-white mb-6">Your Recent Missions</h2>
                        
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-8 h-8 border-2 border-[#EAFE07] border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-3 text-white">Loading missions...</span>
                            </div>
                                ) : missions.length > 0 ? (
                                    <div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {missions.slice(0, 6).map((mission) => (
                                    <Link key={mission.id} href={`/mission-builder/${mission.id}`}>
                                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all cursor-pointer">
                                            <h3 className="text-lg font-semibold text-white mb-2">{mission.title}</h3>
                                            <p className="text-gray-400 text-sm mb-3">{mission.description}</p>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-[#EAFE07] font-semibold">{mission.destination.toUpperCase()}</span>
                                                <span className="text-white">{mission.passengers} passengers</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm mt-2">
                                                <span className="text-gray-400">{mission.duration} days</span>
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    mission.status === 'published' ? 'bg-green-500/20 text-green-300' :
                                                    mission.status === 'draft' ? 'bg-yellow-500/20 text-yellow-300' :
                                                    'bg-gray-500/20 text-gray-300'
                                                }`}>
                                                    {mission.status}
                                                </span>
                                            </div>
                                            
                                            {/* Likes, Author and Date */}
                                            <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-white/10">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-[#EAFE07]">❤️ {mission.likesCount || 0}</span>
                                                </div>
                                                <div className="text-gray-400">
                                                    {new Date(mission.createdAt).toLocaleDateString('en-US', { 
                                                        month: 'short', 
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                        ))}
                                        </div>
                                    </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-400 mb-4">No missions yet. Create your first space habitat!</p>
                                <Link href="/mission-builder/new" className="bg-[#EAFE07] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#EAFE07]/80 transition-colors">
                                    Create Mission
                                </Link>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
