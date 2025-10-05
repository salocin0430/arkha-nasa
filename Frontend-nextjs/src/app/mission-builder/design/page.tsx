'use client';

import { Suspense, useEffect } from 'react';
import ModuleViewer3D from '@/components/ModuleViewer3D';

export default function MissionDesignPage() {
  // Deshabilitar scroll en el main element cuando esta página está activa
  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      // Guardar el estilo original
      const originalOverflow = mainElement.style.overflow;
      
      // Deshabilitar scroll
      mainElement.style.overflow = 'hidden';
      
      // Restaurar al desmontar
      return () => {
        mainElement.style.overflow = originalOverflow;
      };
    }
  }, []);

  return (
    <div className="w-full h-screen">
      <Suspense fallback={
        <div className="w-full h-screen flex items-center justify-center bg-black">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EAFE07] mx-auto mb-4"></div>
            <p className="text-white text-lg">Cargando visor de módulos...</p>
          </div>
        </div>
      }>
        <ModuleViewer3D />
      </Suspense>
    </div>
  );
}