'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { createMission } from '@/application/services/AppService';

export default function NewMission() {
  const [passengers, setPassengers] = useState(10);
  const [time, setTime] = useState(90); // Default: 3 meses
  const [destination, setDestination] = useState('');
  const [isScientific, setIsScientific] = useState(false);

  const router = useRouter();

  const handleDesign = async () => {
    if(!destination) {
        alert("Please select a destination.");
        return;
    }

    try {
      // Get current user
      const userData = localStorage.getItem('user');
      if (!userData) {
        alert("Please log in first.");
        router.push('/login');
        return;
      }

      const user = JSON.parse(userData);

              // Debug: Verificar el valor de isScientific
              console.log('🔬 Creating mission with isScientific:', isScientific);

              // Create mission using Clean Architecture
              const mission = await createMission.execute({
                title: `${destination.charAt(0).toUpperCase() + destination.slice(1)} Mission`,
                description: `A ${time}-day ${isScientific ? 'scientific' : 'regular'} mission to ${destination} for ${passengers} passengers`,
                destination: destination as 'moon' | 'mars',
                passengers,
                duration: time,
                isScientific,
                isPublic: false,
                status: 'draft',
                userId: user.id,
              });

              console.log('✅ Mission created:', mission);

      // Navigate to the 3D design page with mission parameters
      router.push(`/mission-builder/design?missionId=${mission.id}&passengers=${passengers}&duration=${time}&terrain=${destination}&isScientific=${isScientific}`);
    } catch (error) {
      console.error('Error creating mission:', error);
      alert('Failed to create mission. Please try again.');
    }
  }

  return (
    <ProtectedRoute>
      <div className="h-full text-white">
        {/* Main Content */}
        <main className="flex flex-col items-center justify-center h-full p-6 relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-3">WHERE ARE YOU GOING?</h1>
        </div>

        {/* Destination Selection */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setDestination('moon')}
            className={`p-4 rounded-lg border-2 transition-all ${
              destination === 'moon' 
                ? 'border-[#EAFE07] bg-[#EAFE07]/20' 
                : 'border-white/30 bg-white/10 hover:bg-white/20'
            }`}
          >
            <div className="w-24 h-24 rounded-full mb-3 overflow-hidden">
              <img 
                src="/assets/images/moon.jpg" 
                alt="Moon" 
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-white font-semibold text-base">Moon</p>
          </button>
          
          <button
            onClick={() => setDestination('mars')}
            className={`p-4 rounded-lg border-2 transition-all ${
              destination === 'mars' 
                ? 'border-[#EAFE07] bg-[#EAFE07]/20' 
                : 'border-white/30 bg-white/10 hover:bg-white/20'
            }`}
          >
            <div className="w-24 h-24 rounded-full mb-3 overflow-hidden">
              <img 
                src="/assets/images/mars.jpg" 
                alt="Mars" 
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-white font-semibold text-base">Mars</p>
          </button>
        </div>

        {/* Mission Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 w-full max-w-3xl">
          {/* Passengers */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-center bg-[#EAFE07] text-black px-3 py-1 rounded-full mb-3 font-semibold inline-block text-xs">
              PASSENGERS
            </div>
            <div className="flex items-center justify-center">
              <input
                type="number"
                min="1"
                max="300"
                value={passengers}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setPassengers(Math.max(1, Math.min(300, value)));
                }}
                className="bg-blue-900/50 text-white px-6 py-2 rounded-lg font-semibold text-2xl text-center w-32 focus:outline-none focus:ring-2 focus:ring-[#EAFE07] border-none"
                placeholder="1-300"
              />
            </div>
            <div className="text-center text-white/60 text-xs mt-2">
              Min: 1 | Max: 300
            </div>
          </div>

          {/* Time */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
             <div className="text-center bg-[#EAFE07] text-black px-3 py-1 rounded-full mb-3 font-semibold inline-block text-xs">
              DURATION
            </div>
            <div className="bg-blue-900/50 text-white px-6 py-2 rounded-lg font-semibold flex items-center justify-center text-xl">
                <select 
                    value={time} 
                    onChange={(e) => setTime(Number(e.target.value))}
                    className="bg-transparent border-none text-white focus:outline-none appearance-none text-xl cursor-pointer"
                >
                    {/* 1 mes = 30 días */}
                    <option value={30}>30 DAYS (1 month)</option>
                    <option value={60}>60 DAYS (2 months)</option>
                    <option value={90}>90 DAYS (3 months)</option>
                    <option value={120}>120 DAYS (4 months)</option>
                    <option value={150}>150 DAYS (5 months)</option>
                    <option value={180}>180 DAYS (6 months)</option>
                    {/* Medio año */}
                    <option value={210}>210 DAYS (7 months)</option>
                    <option value={240}>240 DAYS (8 months)</option>
                    <option value={270}>270 DAYS (9 months)</option>
                    <option value={300}>300 DAYS (10 months)</option>
                    <option value={330}>330 DAYS (11 months)</option>
                    <option value={365}>365 DAYS (1 year)</option>
                    {/* 1 año+ */}
                    <option value={450}>450 DAYS (15 months)</option>
                    <option value={540}>540 DAYS (18 months)</option>
                    <option value={630}>630 DAYS (21 months)</option>
                    <option value={730}>730 DAYS (2 years)</option>
                    {/* 2 años+ */}
                    <option value={900}>900 DAYS (30 months)</option>
                    <option value={1095}>1095 DAYS (3 years)</option>
                    <option value={1460}>1460 DAYS (4 years)</option>
                    <option value={1825}>1825 DAYS (5 years)</option>
                    <option value={2000}>2000 DAYS (~5.5 years)</option>
                </select>
            </div>
          </div>

          {/* Mission Type */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
             <div className="text-center bg-[#EAFE07] text-black px-3 py-1 rounded-full mb-3 font-semibold inline-block text-xs">
              MISSION TYPE
            </div>
            <div className="flex items-center justify-center">
              <button
                onClick={() => setIsScientific(!isScientific)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  isScientific
                    ? 'bg-[#EAFE07] text-black'
                    : 'bg-white/20 text-white'
                }`}
              >
                {isScientific ? '🔬 SCIENTIFIC' : '👥 REGULAR'}
              </button>
            </div>
          </div>
        </div>

        {/* Design Button */}
        <button 
          onClick={handleDesign}
          className="text-[#EAFE07] border-b-2 border-[#EAFE07] font-semibold hover:text-[#EAFE07]/80 transition-colors text-base"
        >
          DESIGN THE ARKHA
        </button>
        </main>
      </div>
    </ProtectedRoute>
  );
}
