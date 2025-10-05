'use client';

import React, { useRef, useState, useEffect, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  TransformControls, 
  Html, 
  useGLTF, 
  Environment, 
  useProgress
} from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import ModuleConfigService, { ModuleConfig, ArkhaModulesConfig } from '@/services/ModuleConfigService';
import MissionLayoutService, { MissionLayout, ModuleLayout } from '@/services/MissionLayoutService';

// Componente de carga interno (para Suspense de Three.js)
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-8 bg-black/50 backdrop-blur-md rounded-lg">
        <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-gradient-to-r from-gray-600 to-[#EAFE07] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-white text-sm font-medium">
          Loading 3D models... {progress.toFixed(0)}%
        </div>
      </div>
    </Html>
  );
}

// Componente para la iluminación del módulo
function ModuleLighting({ moduleConfig }: { moduleConfig: ModuleConfig }) {
  if (!moduleConfig.lighting?.enabled) {
    return null;
  }

  const { intensity, angle, color, position, type } = moduleConfig.lighting;
  
  // Convertir ángulo de grados a radianes
  const angleInRadians = (angle * Math.PI) / 180;
  
  // Convertir color de string a número
  const lightColor = parseInt(color.replace('0x', ''), 16);

  // 🚀 OPTIMIZACIÓN: Desactivar sombras en luces de módulos (100 luces con sombras = lag extremo)
  if (type === 'spot') {
    return (
      <spotLight
        position={[position[0], position[1], position[2]]}
        intensity={intensity}
        angle={angleInRadians}
        penumbra={0.1}
        color={lightColor}
        castShadow={false}
      />
    );
  } else if (type === 'point') {
    return (
      <pointLight
        position={[position[0], position[1], position[2]]}
        intensity={intensity}
        color={lightColor}
        castShadow={false}
      />
    );
  } else if (type === 'directional') {
    return (
      <directionalLight
        position={[position[0], position[1], position[2]]}
        intensity={intensity}
        color={lightColor}
        castShadow={false}
      />
    );
  }

  return null;
}

// Componente para el modelo 3D - exactamente como en tu proyecto anterior
function ModuleModel({ moduleConfig, onSelect, moduleObjectsMap, onMapUpdate }: { 
  moduleConfig: ModuleConfig; 
  isSelected?: boolean;
  onSelect?: (object: THREE.Object3D | null) => void;
  moduleObjectsMap?: React.MutableRefObject<Map<string, THREE.Object3D>>;
  onMapUpdate?: () => void;
}) {
  const { scene } = useGLTF(moduleConfig.path);
  const groupRef = useRef<THREE.Group>(null);
  
  // 🚀 OPTIMIZACIÓN: Registrar objeto en el mapa cuando se monte
  useEffect(() => {
    if (groupRef.current && moduleObjectsMap && moduleConfig.id) {
      // Crear un ID único para esta instancia específica usando el UUID del objeto
      const instanceId = `${moduleConfig.id}_${groupRef.current.uuid}`;
      moduleObjectsMap.current.set(instanceId, groupRef.current);
      
      // También guardar el tipo de módulo en userData para búsquedas
      groupRef.current.userData.moduleTypeId = moduleConfig.id;
      
      // Notificar al componente padre que el mapa cambió
      if (onMapUpdate) {
        onMapUpdate();
      }
      
      // Cleanup: Eliminar del mapa cuando se desmonte
      return () => {
        moduleObjectsMap.current.delete(instanceId);
        if (onMapUpdate) {
          onMapUpdate();
        }
      };
    }
  }, [moduleConfig.id, moduleObjectsMap, onMapUpdate]);
  
  useEffect(() => {
    if (scene && groupRef.current) {
      // Clonar la escena para evitar conflictos
      const clonedScene = scene.clone();
      
      // Configurar el userData en el GROUP (importante para TransformControls)
      groupRef.current.userData = {
        id: moduleConfig.id,
        name: moduleConfig.name,
        code: moduleConfig.code,
        item: moduleConfig.item,
        type: moduleConfig.type,
        description: moduleConfig.description,
        area: moduleConfig.area,
        volume: moduleConfig.volume,
        image: moduleConfig.image,
        price: moduleConfig.price,
        currency: moduleConfig.currency,
        interactive: true
      };
      
      
      
      // Aplicar propiedades de material
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Marcar como interactivo para el raycaster
          child.userData.interactive = true;
          
          // Aplicar propiedades de material si están definidas
          if (moduleConfig.materialProperties && child.material) {
            const material = child.material as THREE.MeshStandardMaterial;
            
            if (moduleConfig.materialProperties.roughness !== undefined) {
              material.roughness = moduleConfig.materialProperties.roughness;
            }
            if (moduleConfig.materialProperties.metalness !== undefined) {
              material.metalness = moduleConfig.materialProperties.metalness;
            }
            if (moduleConfig.materialProperties.emissiveIntensity !== undefined) {
              material.emissiveIntensity = moduleConfig.materialProperties.emissiveIntensity;
            }
            
            material.needsUpdate = true;
          }
        }
      });
      
      // Limpiar el grupo anterior
      while (groupRef.current.children.length > 0) {
        groupRef.current.remove(groupRef.current.children[0]);
      }
      
      // Agregar la escena clonada
      groupRef.current.add(clonedScene);
    }
  }, [scene, moduleConfig]);
  
  if (!scene) {
    return null;
  }
  
  return (
    <group
      ref={groupRef}
      scale={moduleConfig.scale} 
      position={moduleConfig.position} 
      rotation={moduleConfig.rotation}
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect && groupRef.current) {
          onSelect(groupRef.current);
        }
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Iluminación del módulo */}
      <ModuleLighting moduleConfig={moduleConfig} />
    </group>
  );
}

// Panel de detalles para el módulo seleccionado
function ModuleDetailsPanel({ selectedModule, onClose, onReset, onMoveToFloor, getCurrentFloor }: {
  selectedModule: THREE.Object3D | null;
  onClose: () => void;
  onReset: () => void;
  onMoveToFloor: (floor: number) => void;
  getCurrentFloor: (yPosition: number) => number;
}) {
  if (!selectedModule) return null;
  
  
  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed right-0 top-20 h-[calc(100vh-80px)] w-80 bg-black/50 backdrop-blur-md shadow-2xl z-50 overflow-y-auto"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white truncate pr-2">{selectedModule.userData?.name || 'Module'}</h3>
            {selectedModule.userData?.code && (
              <p className="text-xs text-[#EAFE07] font-mono">{selectedModule.userData.code}</p>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:text-[#EAFE07] transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-3">
          {/* Image */}
          {selectedModule.userData?.image && (
            <div className="mb-3">
              <img 
                src={selectedModule.userData.image} 
                alt={selectedModule.userData?.name || 'Module'}
                className="w-full h-36 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}
          
          {/* Item Number */}
          {selectedModule.userData?.item && (
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-xs text-gray-300 mb-1">Item Number</div>
              <div className="text-[#EAFE07] text-lg font-bold">{selectedModule.userData.item}</div>
            </div>
          )}

          {/* Type */}
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-xs text-gray-300 mb-1">Type</div>
            <div className="text-white text-sm font-medium">{selectedModule.userData?.type || 'Module'}</div>
          </div>

          {/* Area & Volume */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-xs text-gray-300 mb-1">Area</div>
              <div className="text-white text-sm font-semibold">
                {selectedModule.userData?.area || 'N/A'}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-xs text-gray-300 mb-1">Volume</div>
              <div className="text-white text-sm font-semibold">
                {selectedModule.userData?.volume || 'N/A'}
              </div>
            </div>
          </div>
          
          {/* Description */}
          {selectedModule.userData?.description && (
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-xs text-gray-300 mb-1.5 font-semibold">Description</div>
              <div className="text-white text-xs leading-relaxed">{selectedModule.userData.description}</div>
            </div>
          )}
          
          {/* Position */}
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-xs text-gray-300 mb-1.5">Position</div>
            <div className="text-white text-xs font-mono">
              X: {selectedModule.position.x.toFixed(2)}, 
              Y: {selectedModule.position.y.toFixed(2)}, 
              Z: {selectedModule.position.z.toFixed(2)}
            </div>
          </div>

          {/* Selector de Pisos */}
          <div className="bg-gradient-to-r from-[#EAFE07]/20 to-[#EAFE07]/10 rounded-lg p-3 border border-[#EAFE07]/30">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-300">Select Floor</div>
              <div className="text-[#EAFE07] font-bold text-sm">
                Floor {getCurrentFloor(selectedModule.position.y)}
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((floor) => {
                const isCurrentFloor = getCurrentFloor(selectedModule.position.y) === floor;
                return (
                  <button
                    key={floor}
                    onClick={() => onMoveToFloor(floor)}
                    className={`py-1.5 px-1 text-xs rounded-lg font-bold transition-all ${
                      isCurrentFloor
                        ? 'bg-[#EAFE07] text-[#0042A6] scale-110 shadow-lg'
                        : 'bg-white/20 text-white hover:bg-white/30 hover:scale-105'
                    }`}
                  >
                    {floor}
                  </button>
                );
              })}
            </div>
            <div className="text-[10px] text-gray-400 mt-2 text-center">
              3.10m per floor • Max: 7 floors
            </div>
          </div>
          
          {selectedModule.userData?.price !== undefined && typeof selectedModule.userData?.price === 'number' && (
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-xs text-gray-300 mb-1">Price</div>
              <div className="text-[#EAFE07] font-bold text-sm">
                {selectedModule.userData.price} {selectedModule.userData.currency || 'ARKHA'}
              </div>
            </div>
          )}
          
          <div className="pt-2">
            <button 
              onClick={onReset}
              className="w-full bg-[#EAFE07] text-[#0042A6] font-bold py-2.5 px-4 rounded-lg hover:bg-yellow-300 transition-colors text-sm"
            >
              Reset Position
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Escena principal
function ModuleScene({ modulesConfig, missionLayout, savedModules, missionId, saving, setSaving, searchParams, setMissionLayout, setSavedModules }: { 
  modulesConfig: ArkhaModulesConfig;
  missionLayout?: MissionLayout | null;
  savedModules?: Array<{
    id: string;
    moduleConfigId: string;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
  }> | null;
  missionId: string | null;
  saving: boolean;
  setSaving: (saving: boolean) => void;
  searchParams: URLSearchParams | null;
  setMissionLayout: (layout: MissionLayout | null) => void;
  setSavedModules: (modules: Array<{
    id: string;
    moduleConfigId: string;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
  }> | null) => void;
}) {
  const [selectedModule, setSelectedModule] = useState<THREE.Object3D | null>(null);
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const [viewMode, setViewMode] = useState<'orbit' | 'firstPerson' | 'top'>('orbit');
  const [cameraPosition, setCameraPosition] = useState(modulesConfig.cameraPosition);
  const [cameraTarget, setCameraTarget] = useState(modulesConfig.cameraTarget);
  const [, forceUpdate] = useState(0); // Estado para forzar re-render
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isTransforming, setIsTransforming] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const transformTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Función de selección exacta como en tu proyecto anterior
  const selectObject = useCallback((object: THREE.Object3D | null) => {
    // Actualizar el estado
    setSelectedModule(object);
    
    // Adjuntar los controles al objeto seleccionado
    if (object && transformRef.current) {
      // Guardar posición Y original para restricciones en vista 2D
      if (!object.userData.originalY) {
        object.userData.originalY = object.position.y;
      }
      
      transformRef.current.attach(object);
      
      // Configurar el evento inmediatamente después de adjuntar
      setTimeout(() => {
        if (transformRef.current && controlsRef.current) {
          const transformControls = transformRef.current;
          const orbitControls = controlsRef.current;
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const handleDraggingChanged = (event: any) => {
            orbitControls.enabled = !event.value;
          };
          
          // Remover listener anterior si existe
          transformControls.removeEventListener('dragging-changed', handleDraggingChanged);
          
          // Agregar nuevo listener
          transformControls.addEventListener('dragging-changed', handleDraggingChanged);
        }
      }, 10);
    } else if (transformRef.current) {
      transformRef.current.detach();
    }
  }, []);

  // Sistema de pisos (1-7) con altura de 3.10m por piso
  const FLOOR_HEIGHT = 3.10;
  const MAX_FLOORS = 7;
  const MIN_FLOOR = 1;

  // Calcular piso actual basado en posición Y
  // Los módulos están a 0m, 3.10m, 6.20m, etc.
  const getCurrentFloor = useCallback((yPosition: number): number => {
    return Math.max(1, Math.min(MAX_FLOORS, Math.floor(yPosition / FLOOR_HEIGHT) + 1));
  }, []);

  // Mover módulo a un piso específico
  const moveToFloor = useCallback((floor: number) => {
    if (selectedModule && viewMode === 'orbit') {
      if (floor >= MIN_FLOOR && floor <= MAX_FLOORS) {
        // Piso 1 = 0m, Piso 2 = 3.10m, Piso 3 = 6.20m, etc.
        const newY = (floor - 1) * FLOOR_HEIGHT;
        selectedModule.position.y = newY;
        // Forzar re-render para actualizar UI
        forceUpdate(prev => prev + 1);
      }
    }
  }, [selectedModule, viewMode, forceUpdate]);

  // Referencias para Three.js (como en tu proyecto)
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  
  // Estados para primera persona y vuelo - Con controles de altura Q/E
  const [keysPressed, setKeysPressed] = useState({
    w: false, 
    a: false, 
    s: false, 
    d: false,
    q: false,  // Bajar piso
    e: false   // Subir piso
  });
  
  // Estado para el piso actual en primera persona (no se recalcula constantemente)
  const [currentFloor, setCurrentFloor] = useState(1);
  
  // Ref para evitar múltiples cambios de piso al mantener presionada la tecla
  const lastFloorChangeTime = useRef<number>(0);
  const FLOOR_CHANGE_COOLDOWN = 300; // ms entre cambios de piso
  
  // 🚀 OPTIMIZACIÓN: Mapa de módulos por ID para selección rápida desde sidebar
  const moduleObjectsMap = useRef<Map<string, THREE.Object3D>>(new Map());
  
  // Estado para forzar re-render de la sidebar cuando cambia el mapa
  const [sidebarUpdate, setSidebarUpdate] = useState(0);
  
  // Función para actualizar la sidebar cuando cambia el mapa
  const handleMapUpdate = useCallback(() => {
    setSidebarUpdate(prev => prev + 1);
  }, []);
  
  // Estados para los parámetros de la misión (editables)
  const [missionPassengers, setMissionPassengers] = useState<number>(() => {
    const passengersParam = searchParams?.get('passengers');
    return passengersParam ? parseInt(passengersParam) : 10;
  });
  const [missionDuration, setMissionDuration] = useState<number>(() => {
    const durationParam = searchParams?.get('duration');
    return durationParam ? parseInt(durationParam) : 90;
  });
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  // Función para regenerar la misión con nuevos parámetros
  const handleRegenerateMission = useCallback(async () => {
    if (isRegenerating) return;
    
    setIsRegenerating(true);
    setSelectedModule(null);
    
    try {
      // 1. Si hay missionId, eliminar módulos de la base de datos
      if (missionId) {
        console.log('🗑️  Deleting existing modules from database...');
        const { ModuleService } = await import('../application/services/ModuleService');
        const moduleService = new ModuleService();
        await moduleService.deleteAllModules(missionId);
        console.log('✅ Database modules deleted');
      }
      
      // 2. Limpiar módulos actuales de la escena
      moduleObjectsMap.current.clear();
      setSidebarUpdate(prev => prev + 1);
      
      // 3. Llamar al microservicio con los nuevos parámetros
      const terrainParam = searchParams?.get('terrain') || 'moon';
      const isScientificParam = searchParams?.get('isScientific') === 'true';
      
      const layout = await MissionLayoutService.getInstance().generateMissionLayout({
        passengers: missionPassengers,
        duration: missionDuration,
        terrain: terrainParam as 'moon' | 'mars' | 'asteroid',
        isScientific: isScientificParam
      });
      
      console.log('🔄 Mission regenerated with new parameters:', {
        passengers: missionPassengers,
        duration: missionDuration,
        modules: layout.modules.length,
        deletedFromDB: !!missionId
      });
      
      // 4. Actualizar estado con nuevo layout
      setMissionLayout(layout);
      setSavedModules(null); // Limpiar módulos guardados de memoria
    } catch (error) {
      console.error('❌ Error regenerating mission:', error);
    } finally {
      setIsRegenerating(false);
    }
  }, [isRegenerating, missionPassengers, missionDuration, searchParams, missionId]);

  // Función para configurar la cámara para primera persona
  const setupFirstPersonCamera = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    
    if (viewMode === 'firstPerson') {
      // Posición de primera persona (altura de persona)
      camera.position.set(0, 1.7, 5);
      controls.target.set(0, 1.7, 0); // Mirar al frente a la altura de los ojos
      
      // Inicializar piso actual
      setCurrentFloor(1);
      
      // ✅ HABILITAR OrbitControls para rotación con mouse (como en tu proyecto)
      controls.enabled = true;
      controls.update();
    } else if (viewMode === 'top') {
      // Vista cenital pura (desde arriba, perpendicular al suelo)
      camera.position.set(0, 25, 0);
      controls.target.set(0, 0, 0);
      
      // BLOQUEAR rotación completamente - Solo movimiento 2D (pan) y zoom
      controls.enableRotate = false; // ❌ Sin rotación - vista fija desde arriba
      controls.enableZoom = true;    // ✅ Zoom habilitado
      controls.enablePan = true;     // ✅ Pan (arrastrar) habilitado para moverse en el plano 2D
      controls.minDistance = 5;      // Zoom mínimo
      controls.maxDistance = 100;    // Zoom máximo
      controls.enabled = true;
      controls.update();
    } else {
      // Restaurar vista normal
      camera.position.set(modulesConfig.cameraPosition[0], modulesConfig.cameraPosition[1], modulesConfig.cameraPosition[2]);
      controls.target.set(modulesConfig.cameraTarget[0], modulesConfig.cameraTarget[1], modulesConfig.cameraTarget[2]);
      camera.rotation.set(0, 0, 0);
      
      // Restaurar configuraciones de OrbitControls en modo órbita
      controls.enableRotate = true;
      controls.enableZoom = true;
      controls.enablePan = true;
      controls.minPolarAngle = 0;
      controls.maxPolarAngle = Math.PI;
      controls.enabled = true;
      controls.update();
    }
  }, [viewMode, modulesConfig.cameraPosition, modulesConfig.cameraTarget]);

  // Función para mover la cámara con controles de altura Q/E para modo vuelo
  // 🚀 OPTIMIZACIÓN: Reutilizar vectores en lugar de crear nuevos cada frame
  const directionVector = useRef(new THREE.Vector3());
  const rightVector = useRef(new THREE.Vector3());

  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    
    // Verificar si hay alguna tecla presionada
    if (!keysPressed.w && !keysPressed.a && !keysPressed.s && !keysPressed.d && !keysPressed.q && !keysPressed.e) return;
    
    // Reutilizar vectores existentes (mucho más rápido)
    const direction = directionVector.current;
    direction.set(0, 0, -1);
    direction.applyQuaternion(camera.quaternion);
    direction.y = 0; // Mantener movimiento horizontal
    direction.normalize();
    
    // Vector derecha (perpendicular a la dirección)
    const right = rightVector.current;
    right.set(1, 0, 0);
    right.applyQuaternion(camera.quaternion);
    right.y = 0; // Mantener movimiento horizontal
    right.normalize();
    
    // Velocidad de movimiento dinámica basada en el piso actual
    // A mayor altura, mayor velocidad para compensar la perspectiva
    const baseSpeed = 0.07;
    const speed = baseSpeed * (1 + (currentFloor - 1) * 0.3); // Incremento del 30% por piso
    
    // Movimiento horizontal (WASD)
    if (keysPressed.w) {
      camera.position.x += direction.x * speed;
      camera.position.z += direction.z * speed;
    }
    if (keysPressed.s) {
      camera.position.x -= direction.x * speed;
      camera.position.z -= direction.z * speed;
    }
    if (keysPressed.a) {
      camera.position.x -= right.x * speed;
      camera.position.z -= right.z * speed;
    }
    if (keysPressed.d) {
      camera.position.x += right.x * speed;
      camera.position.z += right.z * speed;
    }
    
    // 🏢 CAMBIO DE PISO con Q/E en Primera Persona (incrementos de 3.10m)
    if (viewMode === 'firstPerson') {
      const now = Date.now();
      if (now - lastFloorChangeTime.current > FLOOR_CHANGE_COOLDOWN) {
        
        if (keysPressed.e && currentFloor < MAX_FLOORS) {
          // E = Subir un piso
          const newFloor = currentFloor + 1;
          // Ajustar para que el piso 1 esté a la altura de una persona (1.7m)
          camera.position.y = (newFloor - 1) * FLOOR_HEIGHT + 1.7;
          controls.target.y = camera.position.y;
          setCurrentFloor(newFloor); // Actualizar estado del piso
          lastFloorChangeTime.current = now;
          forceUpdate(prev => prev + 1);
        }
        
        if (keysPressed.q && currentFloor > MIN_FLOOR) {
          // Q = Bajar un piso
          const newFloor = currentFloor - 1;
          // Ajustar para que el piso 1 esté a la altura de una persona (1.7m)
          camera.position.y = (newFloor - 1) * FLOOR_HEIGHT + 1.7;
          controls.target.y = camera.position.y;
          setCurrentFloor(newFloor); // Actualizar estado del piso
          lastFloorChangeTime.current = now;
          forceUpdate(prev => prev + 1);
        }
      }
    }
    
    // Actualizar el punto de mira
    controls.target.set(
      camera.position.x + direction.x,
      controls.target.y,
      camera.position.z + direction.z
    );
    
    controls.update();
  }, [keysPressed, viewMode, currentFloor]);

  // Event listeners para teclado - Solo para Primera Persona
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Solo activar teclas en modo Primera Persona
      if (viewMode !== 'firstPerson') {
        return;
      }
      
      // 🚀 OPTIMIZACIÓN: Ignorar eventos repetidos del sistema (key repeat)
      if (event.repeat) {
        return;
      }
      
      const key = event.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'q', 'e'].includes(key)) {
        event.preventDefault();
        setKeysPressed(prev => {
          // Solo actualizar si el estado realmente cambió
          if (prev[key as keyof typeof prev]) return prev;
          return { ...prev, [key]: true };
        });
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'q', 'e'].includes(key)) {
        event.preventDefault();
        setKeysPressed(prev => {
          // Solo actualizar si el estado realmente cambió
          if (!prev[key as keyof typeof prev]) return prev;
          return { ...prev, [key]: false };
        });
      }
    };

    if (viewMode !== 'orbit') {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, [viewMode]);

  // ❌ Controles de mouse ELIMINADOS - OrbitControls maneja la rotación automáticamente

  // Bucle de animación - EXACTAMENTE como tu proyecto de referencia
  useEffect(() => {
    if (viewMode === 'orbit') return;
    
    let animationId: number;
    
    const animate = () => {
      // Actualizar la posición de la cámara según las teclas presionadas
      updateCameraPosition();
      
      // Solicitar el siguiente frame
      animationId = requestAnimationFrame(animate);
    };
    
    // Iniciar el bucle
    animationId = requestAnimationFrame(animate);
    
    // Limpiar al desmontar
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [viewMode, updateCameraPosition]);

  // Configurar cámara cuando cambia el modo de vista
  useEffect(() => {
    setupFirstPersonCamera();
  }, [setupFirstPersonCamera]);

  // Evento dragging-changed exactamente como en tu proyecto anterior
  useEffect(() => {
    if (transformRef.current && controlsRef.current) {
      const transformControls = transformRef.current;
      const orbitControls = controlsRef.current;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleDraggingChanged = (event: any) => {
        orbitControls.enabled = !event.value;
      };
      
      // Remover listener anterior si existe
      transformControls.removeEventListener('dragging-changed', handleDraggingChanged);
      
      // Agregar nuevo listener
      transformControls.addEventListener('dragging-changed', handleDraggingChanged);
      
      return () => {
        transformControls.removeEventListener('dragging-changed', handleDraggingChanged);
      };
    }
  }, [selectedModule]);

  
  // Resetear la posición del módulo seleccionado
  const resetModulePosition = () => {
    if (selectedModule) {
      selectedModule.position.set(0, 0, 0);
      selectedModule.rotation.set(0, 0, 0);
      selectedModule.scale.set(1, 1, 1);
      
      // Forzar actualización
      if (selectedModule.updateMatrixWorld) {
        selectedModule.updateMatrixWorld();
      }
    }
  };

  // Función para guardar la misión con las posiciones actuales de todos los módulos
  const handleSaveMission = async () => {
    if (!missionId || !sceneRef.current) {
      alert('No mission ID found. Please create a mission first.');
      return;
    }

    setSaving(true);
    try {
      // Capturar todos los módulos de la escena
      const modulesToSave: Array<{
        moduleConfigId: string;
        position: { x: number; y: number; z: number };
        rotation: { x: number; y: number; z: number };
        scale: { x: number; y: number; z: number };
      }> = [];

      // Recorrer la escena y encontrar todos los objetos que son módulos
      sceneRef.current.traverse((object: THREE.Object3D) => {
        // Solo guardar objetos que tienen userData con id (son módulos)
        if (object.userData && object.userData.id && object.userData.type) {
          modulesToSave.push({
            moduleConfigId: object.userData.id,
            position: {
              x: object.position.x,
              y: object.position.y,
              z: object.position.z,
            },
            rotation: {
              x: object.rotation.x,
              y: object.rotation.y,
              z: object.rotation.z,
            },
            scale: {
              x: object.scale.x,
              y: object.scale.y,
              z: object.scale.z,
            },
          });
        }
      });

      console.log('💾 Saving mission with modules:', modulesToSave);

      // Llamar al servicio para guardar los módulos en Supabase
      const { ModuleService } = await import('../application/services/ModuleService');
      const moduleService = new ModuleService();
      
      await moduleService.saveModules({
        missionId,
        modules: modulesToSave,
      });

      alert(`✅ Mission saved successfully!\n${modulesToSave.length} modules saved.`);
    } catch (error) {
      console.error('Error saving mission:', error);
      alert('❌ Failed to save mission. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Panel de edición de parámetros de misión */}
      {(searchParams?.get('passengers') || searchParams?.get('duration')) && (
        <div className="fixed top-24 left-60 z-50">
          <div className="bg-black/70 backdrop-blur-md rounded-lg p-3 border border-[#EAFE07]/30 shadow-2xl">
            <div className="flex items-end space-x-3">
              {/* Passengers */}
              <div>
                <label className="text-[10px] text-gray-300 block mb-1">PASSENGERS</label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={missionPassengers}
                  onChange={(e) => setMissionPassengers(Math.max(1, Math.min(300, parseInt(e.target.value) || 1)))}
                  className="w-20 bg-white/10 text-white px-2 py-1.5 rounded-lg text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#EAFE07] border border-white/20"
                  disabled={isRegenerating}
                />
              </div>
              
              {/* Duration - Select */}
              <div>
                <label className="text-[10px] text-gray-300 block mb-1">DURATION</label>
                <select
                  value={missionDuration}
                  onChange={(e) => setMissionDuration(parseInt(e.target.value))}
                  className="w-28 bg-white/10 text-white px-2 py-1.5 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#EAFE07] border border-white/20 cursor-pointer"
                  disabled={isRegenerating}
                >
                  <option value="30" className="bg-[#0042A6]">30 days</option>
                  <option value="60" className="bg-[#0042A6]">60 days</option>
                  <option value="90" className="bg-[#0042A6]">90 days</option>
                  <option value="120" className="bg-[#0042A6]">120 days</option>
                  <option value="150" className="bg-[#0042A6]">150 days</option>
                  <option value="180" className="bg-[#0042A6]">180 days</option>
                  <option value="270" className="bg-[#0042A6]">270 days</option>
                  <option value="365" className="bg-[#0042A6]">1 year</option>
                  <option value="540" className="bg-[#0042A6]">540 days</option>
                  <option value="730" className="bg-[#0042A6]">2 years</option>
                  <option value="1095" className="bg-[#0042A6]">3 years</option>
                  <option value="1460" className="bg-[#0042A6]">4 years</option>
                  <option value="1825" className="bg-[#0042A6]">5 years</option>
                </select>
              </div>
              
              {/* Regenerate Button */}
              <button
                onClick={handleRegenerateMission}
                disabled={isRegenerating}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                  isRegenerating
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-[#EAFE07] text-[#0042A6] hover:bg-[#d8ef00]'
                }`}
              >
                {isRegenerating ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Update</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        /* Ocultar el cubo amarillo del TransformControls */
        .transform-controls .box-helper {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }
        
        /* Ocultar el gizmo central */
        .transform-controls .gizmo {
          display: none !important;
        }
        
        /* Ocultar cualquier elemento de selección central */
        .transform-controls [class*="box"],
        .transform-controls [class*="gizmo"],
        .transform-controls [class*="helper"] {
          display: none !important;
        }
      `}</style>
      <Canvas 
        shadows 
        camera={{ 
          position: cameraPosition, 
          fov: 75 
        }} 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onClick={(e: any) => {
          if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
          
          // Calcular posición del mouse normalizada
          const rect = rendererRef.current.domElement.getBoundingClientRect();
          const mouse = new THREE.Vector2();
          mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          
          // Lanzar rayo desde la cámara
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(mouse, cameraRef.current);
          
          // Obtener solo los objetos interactivos para intersección
          const selectableObjects: THREE.Object3D[] = [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sceneRef.current.traverse((object: any) => {
            if (object.isMesh && object.userData && object.userData.interactive === true) {
              selectableObjects.push(object);
            }
          });
          
          // Calcular intersecciones
          const intersects = raycaster.intersectObjects(selectableObjects, false);
          
          if (intersects.length > 0) {
            // Encontrar el objeto raíz
            let selectedObj = intersects[0].object;
            
            // Si el objeto es parte de un grupo, seleccionar el grupo
            while (selectedObj.parent && selectedObj.parent !== sceneRef.current && selectedObj.parent.type !== 'Scene') {
              if (selectedObj.parent.userData && selectedObj.parent.userData.id) {
                selectedObj = selectedObj.parent;
                break;
              }
              selectedObj = selectedObj.parent;
            }
            
            // Seleccionar el objeto
            selectObject(selectedObj);
          } else {
            // Si no hay intersección, deseleccionar el objeto actual
            selectObject(null);
          }
        }}
        style={{ background: '#000000' }}
        onCreated={({ scene, camera, gl }) => {
          sceneRef.current = scene;
          cameraRef.current = camera;
          rendererRef.current = gl;
        }}
      >
        <Suspense fallback={null}>
          {/* Iluminación */}
          <ambientLight 
            color={modulesConfig.lighting.ambient.color}
            intensity={modulesConfig.lighting.ambient.intensity} 
          />
          <directionalLight 
            color={modulesConfig.lighting.directional.color}
            intensity={modulesConfig.lighting.directional.intensity}
            position={modulesConfig.lighting.directional.position}
            castShadow={modulesConfig.lighting.directional.castShadow}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          {/* Entorno espacial - Fondo negro del espacio */}
          <Environment preset="night" />
        
          {/* Suelo lunar simple (plano) */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
            <planeGeometry args={[500, 500]} />
            <meshStandardMaterial 
              color="#6a6a6a"
              roughness={0.9}
              metalness={0.05}
            />
          </mesh>

          {/* Modelo base - Terreno lunar detallado (opcional si no está hidden) */}
          {modulesConfig.baseModel && !modulesConfig.baseModel.hidden && (
            <ModuleModel 
              moduleConfig={modulesConfig.baseModel} 
              onSelect={selectObject}
              moduleObjectsMap={moduleObjectsMap}
              onMapUpdate={handleMapUpdate}
            />
          )}
          
          {/* Módulos - Renderizar según savedModules, layout de misión o configuración por defecto */}
          {savedModules && savedModules.length > 0 ? (
            // Renderizar módulos guardados de la base de datos
            savedModules.map((savedModule) => {
              const moduleConfig = modulesConfig.modules.find(m => m.id === savedModule.moduleConfigId);
              if (!moduleConfig) {
                console.warn(`⚠️ No se encontró configuración para módulo: ${savedModule.moduleConfigId}`);
                return null;
              }
              
              
              // Usar las posiciones guardadas
              const moduleWithSavedPosition = {
                ...moduleConfig,
                position: [savedModule.position.x, savedModule.position.y, savedModule.position.z] as [number, number, number],
                rotation: [savedModule.rotation.x, savedModule.rotation.y, savedModule.rotation.z] as [number, number, number],
                scale: [savedModule.scale.x, savedModule.scale.y, savedModule.scale.z] as [number, number, number],
                hidden: false,
              };

              return (
                <ModuleModel 
                  key={`saved-module-${savedModule.id}`}
                  moduleConfig={moduleWithSavedPosition} 
                  isSelected={selectedModule?.userData?.id === moduleConfig.id}
                  onSelect={selectObject}
                  moduleObjectsMap={moduleObjectsMap}
                  onMapUpdate={handleMapUpdate}
                />
              );
            })
          ) : missionLayout ? (
            // Renderizar módulos según el layout de la misión (nuevas misiones)
            missionLayout.modules.map((layoutModule: ModuleLayout, index: number) => {
              const moduleConfig = modulesConfig.modules.find(m => m.id === layoutModule.id);
              if (!moduleConfig) {
                console.warn(`⚠️ No se encontró configuración para módulo: ${layoutModule.id}`);
                return null;
              }
              
              // Combinar configuración base con posición de la misión
              const moduleWithMissionPosition = {
                ...moduleConfig,
                position: layoutModule.position,
                rotation: layoutModule.rotation,
                scale: layoutModule.scale,
                hidden: false, // Mostrar todos los módulos de la misión
              };
              
              return (
                <ModuleModel 
                  key={`mission-module-${index}`}
                  moduleConfig={moduleWithMissionPosition} 
                  isSelected={selectedModule?.userData?.id === moduleConfig.id}
                  onSelect={selectObject}
                  moduleObjectsMap={moduleObjectsMap}
                  onMapUpdate={handleMapUpdate}
                />
              );
            })
          ) : (
            // Renderizar módulos de la configuración por defecto (solo los no ocultos)
            modulesConfig.modules
              .filter(module => !module.hidden)
              .map((module) => (
                <ModuleModel 
                  key={module.id}
                  moduleConfig={module} 
                  isSelected={selectedModule?.userData?.id === module.id}
                  onSelect={selectObject}
                  moduleObjectsMap={moduleObjectsMap}
                  onMapUpdate={handleMapUpdate}
                />
              ))
          )}
        </Suspense>
        
        {/* Controles de órbita - SIEMPRE habilitados */}
        <OrbitControls 
          ref={controlsRef}
          enablePan={viewMode === 'orbit' ? !isTransforming : viewMode === 'top'}  // ✅ Pan en órbita y vista 2D
          enableZoom={true}  // ✅ Zoom habilitado en todos los modos
          enableRotate={true}  // ✅ Rotación habilitada (se controla en setupFirstPersonCamera)
          target={cameraTarget}
          minDistance={viewMode === 'orbit' ? 5 : viewMode === 'top' ? 5 : 0.5}
          maxDistance={viewMode === 'orbit' ? 50 : viewMode === 'top' ? 100 : 100}
          mouseButtons={{
            LEFT: viewMode === 'top' ? 2 : 0,   // En vista 2D: LEFT = PAN, en otros: LEFT = ROTATE
            MIDDLE: 1,                            // MIDDLE = ZOOM
            RIGHT: viewMode === 'top' ? 0 : 2    // En vista 2D: RIGHT = ROTATE (deshabilitado), en otros: RIGHT = PAN
          }}
          enabled={true}  // ✅ SIEMPRE habilitado
        />
        
        {/* Controles de transformación - para órbita (3D) y vista 2D (X,Z) */}
        {selectedModule && (viewMode === 'orbit' || viewMode === 'top') && (
          <TransformControls
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ref={(ref: any) => {
              transformRef.current = ref;
              // Configurar el evento inmediatamente cuando se crea el TransformControls
              if (ref && controlsRef.current) {
                const orbitControls = controlsRef.current;
                
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const handleDraggingChanged = (event: any) => {
                  orbitControls.enabled = !event.value;
                };
                
                // Remover listener anterior si existe
                ref.removeEventListener('dragging-changed', handleDraggingChanged);
                
                // Agregar nuevo listener
                ref.addEventListener('dragging-changed', handleDraggingChanged);
              }
            }}
            object={selectedModule}
            mode={transformMode}
            size={0.7}
            showX={
              transformMode === 'rotate' 
                ? false  // Rotate: NO mostrar X (en ambos modos)
                : viewMode === 'orbit' ? true : true  // Move/Scale: mostrar X
            }
            showY={
              viewMode === 'orbit' 
                ? transformMode === 'rotate' ? true : false  // Órbita: mostrar Y solo en rotate, ocultar en translate (usar selector de pisos)
                : transformMode === 'rotate' ? true : false  // 2D: mostrar Y solo en rotate
            }
            showZ={
              transformMode === 'rotate' 
                ? false  // Rotate: NO mostrar Z (en ambos modos)
                : viewMode === 'orbit' ? true : true  // Move/Scale: mostrar Z
            }
            translationSnap={viewMode === 'top' && transformMode === 'translate' ? 0.1 : null}
            rotationSnap={viewMode === 'top' && transformMode === 'rotate' ? Math.PI / 12 : null}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onObjectChange={(e: any) => {
              if (e && e.target && typeof e.target === 'object' && e.target !== null) {
                const target = e.target;
                
                // En modo ÓRBITA y 2D, solo permitir rotación en Y (horizontal)
                if (transformMode === 'rotate') {
                  // Bloquear rotación en X y Z (solo permitir rotación en Y - horizontal)
                  target.rotation.x = 0;
                  target.rotation.z = 0;
                }
                
                // En vista 2D, también bloquear movimiento en Y (mantener altura constante)
                if (viewMode === 'top') {
                  if (transformMode === 'translate' && target.userData?.originalY !== undefined) {
                    target.position.y = target.userData.originalY;
                  }
                }
              }
            }}
          />
        )}
      </Canvas>
      
      {/* Panel lateral de módulos */}
      <div className="fixed left-0 top-20 h-[calc(100vh-80px)] w-56 bg-black/50 backdrop-blur-md shadow-2xl z-40 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center mb-4">
            <div className="w-7 h-7 bg-[#EAFE07] rounded-lg mr-2 flex items-center justify-center">
              <span className="text-[#0042A6] font-bold text-xs">A</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">ARKHA</h2>
              <p className="text-xs text-gray-300">Modules</p>
            </div>
          </div>
          
          {/* Estadísticas de módulos */}
          <div className="bg-gradient-to-r from-[#EAFE07]/20 to-[#EAFE07]/10 rounded-lg p-3 mb-3 border border-[#EAFE07]/30">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] text-gray-300 mb-0.5">Total Modules</div>
                <div className="text-xl font-bold text-[#EAFE07]">{moduleObjectsMap.current.size}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-300 mb-0.5">Module Types</div>
                <div className="text-xl font-bold text-white">
                  {(() => {
                    const types = new Set<string>();
                    Array.from(moduleObjectsMap.current.values()).forEach(obj => {
                      const typeId = obj.userData?.moduleTypeId || obj.userData?.id;
                      if (typeId) types.add(typeId);
                    });
                    return types.size;
                  })()}
                </div>
              </div>
            </div>
          </div>
          
                  {/* Información del modo actual */}
                  <div className="bg-white/10 rounded-lg p-3 mb-3">
                    <div className="text-xs text-gray-300 mb-1">View Mode</div>
                    <div className="text-white text-sm font-medium capitalize flex items-center">
                      {viewMode}
                      {viewMode !== 'orbit' && (
                        <span className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      )}
                    </div>
                    {viewMode !== 'orbit' && (
                      <div className="text-[10px] text-gray-400 mt-1.5 space-y-0.5">
                        <div>WASD: Move camera</div>
                        <div>Mouse: Look around</div>
                        <div>Scroll: Zoom</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Estado de transformación */}
                  {selectedModule && viewMode === 'orbit' && (
                    <div className={`rounded-lg p-3 mb-3 ${isTransforming ? 'bg-green-500/20' : 'bg-[#EAFE07]/20'}`}>
                      <div className="text-xs text-[#EAFE07] mb-1">Selected Module</div>
                      <div className="text-white text-sm font-medium truncate">{selectedModule.userData?.name || 'Module'}</div>
                      <div className="text-[10px] text-gray-300 mt-1">
                        Mode: {transformMode === 'translate' ? 'Move' : transformMode === 'rotate' ? 'Rotate' : 'Scale'}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1.5">
                        {isTransforming ? '🔄 Transforming...' : 'Drag controls to transform'}
                      </div>
                    </div>
                  )}
          
          {/* Botón de exportar a PDF */}
          <button
            onClick={() => {
              // Agrupar módulos por tipo
              const modulesByType = new Map<string, { config: ModuleConfig; count: number; objects: THREE.Object3D[] }>();
              
              Array.from(moduleObjectsMap.current.entries()).forEach(([instanceId, moduleObject]) => {
                // Obtener el tipo de módulo desde userData
                const moduleTypeId = moduleObject.userData?.moduleTypeId || moduleObject.userData?.id;
                if (!moduleTypeId) return;
                
                const moduleConfig = modulesConfig.modules.find(m => m.id === moduleTypeId);
                if (!moduleConfig) return;
                
                const existing = modulesByType.get(moduleConfig.id);
                if (existing) {
                  existing.count++;
                  existing.objects.push(moduleObject);
                } else {
                  modulesByType.set(moduleConfig.id, {
                    config: moduleConfig,
                    count: 1,
                    objects: [moduleObject]
                  });
                }
              });
              
              // Crear contenido del PDF
              let pdfContent = '=== ARKHA MISSION MODULE REPORT ===\n\n';
              pdfContent += `Total Modules: ${moduleObjectsMap.current.size}\n`;
              pdfContent += `Module Types: ${modulesByType.size}\n\n`;
              pdfContent += '--- MODULE BREAKDOWN ---\n\n';
              
              Array.from(modulesByType.values()).forEach(({ config, count }) => {
                pdfContent += `${config.name}\n`;
                pdfContent += `  Type: ${config.type}\n`;
                pdfContent += `  Code: ${config.code || 'N/A'}\n`;
                pdfContent += `  Quantity: ${count} unit${count > 1 ? 's' : ''}\n`;
                if (config.area) pdfContent += `  Area: ${config.area}\n`;
                if (config.volume) pdfContent += `  Volume: ${config.volume}\n`;
                pdfContent += `\n`;
              });
              
              // Descargar como archivo de texto (simple, sin dependencias)
              const blob = new Blob([pdfContent], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `arkha-mission-modules-${new Date().toISOString().split('T')[0]}.txt`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="w-full mb-3 px-3 py-2 bg-[#EAFE07] text-[#0042A6] rounded-lg font-medium text-xs hover:bg-[#d8ef00] transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="flex flex-col items-center leading-tight">
              <span>Generate</span>
              <span>Technical Report</span>
            </div>
          </button>

          <div className="space-y-1.5">
            {/* 🎯 Agrupar módulos por tipo y mostrar cantidad */}
            {/* Update trigger: {sidebarUpdate} */}
            {(() => {
              // Agrupar módulos por tipo
              const modulesByType = new Map<string, { config: ModuleConfig; count: number; objects: THREE.Object3D[] }>();
              
              Array.from(moduleObjectsMap.current.entries()).forEach(([instanceId, moduleObject]) => {
                // Obtener el tipo de módulo desde userData
                const moduleTypeId = moduleObject.userData?.moduleTypeId || moduleObject.userData?.id;
                if (!moduleTypeId) return;
                
                const moduleConfig = modulesConfig.modules.find(m => m.id === moduleTypeId);
                if (!moduleConfig) return;
                
                const existing = modulesByType.get(moduleConfig.id);
                if (existing) {
                  existing.count++;
                  existing.objects.push(moduleObject);
                } else {
                  modulesByType.set(moduleConfig.id, {
                    config: moduleConfig,
                    count: 1,
                    objects: [moduleObject]
                  });
                }
              });
              
              return Array.from(modulesByType.values()).map(({ config, count, objects }) => (
                <div 
                  key={config.id}
                  className={`p-2.5 rounded-lg cursor-pointer transition-all ${
                    selectedModule?.userData?.id === config.id 
                      ? 'bg-[#EAFE07] text-[#0042A6]' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  onClick={() => {
                    // 🚀 Seleccionar el primer objeto de este tipo
                    if (objects.length > 0) {
                      selectObject(objects[0]);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="w-8 h-8 bg-white/20 rounded-lg mr-2 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold">
                          {config.type.split(' ')[0].charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{config.name}</div>
                        <div className="text-[10px] opacity-75 truncate">{config.type}</div>
                      </div>
                    </div>
                    {/* Contador de unidades */}
                    <div className="ml-2 flex-shrink-0">
                      <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        selectedModule?.userData?.id === config.id
                          ? 'bg-[#0042A6] text-[#EAFE07]'
                          : 'bg-[#EAFE07] text-[#0042A6]'
                      }`}>
                        ×{count}
                      </div>
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
      
      {/* Controles de transformación y vista */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 flex space-x-2">
          {/* Controles de transformación - solo en orbit y top */}
          {viewMode !== 'firstPerson' && (
            <>
              <button 
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  transformMode === 'translate' 
                    ? 'bg-[#EAFE07] text-[#0042A6]' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                onClick={() => setTransformMode('translate')}
              >
                Move
              </button>
              <button 
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  transformMode === 'rotate' 
                    ? 'bg-[#EAFE07] text-[#0042A6]' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                onClick={() => setTransformMode('rotate')}
              >
                Rotate
              </button>
              <button 
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  transformMode === 'scale' 
                    ? 'bg-[#EAFE07] text-[#0042A6]' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                onClick={() => setTransformMode('scale')}
              >
                Scale
              </button>
              
              <div className="w-px bg-white/30 mx-2"></div>
            </>
          )}
          
          {/* Controles de vista */}
          <button 
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'orbit' 
                ? 'bg-[#EAFE07] text-[#0042A6]' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            onClick={() => setViewMode('orbit')}
          >
            Orbit
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'firstPerson' 
                ? 'bg-[#EAFE07] text-[#0042A6]' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            onClick={() => {
              // Si viene de Vista 2D, primero volver a Órbita
              if (viewMode === 'top') {
                setViewMode('orbit');
                // Esperar un momento antes de cambiar a primera persona
                setTimeout(() => setViewMode('firstPerson'), 100);
              } else {
                setViewMode('firstPerson');
              }
            }}
          >
            First Person
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'top' 
                ? 'bg-[#EAFE07] text-[#0042A6]' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            onClick={() => setViewMode('top')}
          >
            2D View
          </button>
          
          <div className="w-px bg-white/30 mx-2"></div>
          
          <button 
            className="px-4 py-2 rounded-lg font-medium bg-white/20 text-white hover:bg-white/30 transition-all"
            onClick={() => {
              setCameraPosition(modulesConfig.cameraPosition);
              setCameraTarget(modulesConfig.cameraTarget);
              controlsRef.current?.reset();
            }}
          >
            Reset
          </button>

          {/* Botón Save Mission - solo si hay missionId */}
          {missionId && (
            <>
              <div className="w-px bg-white/30 mx-2"></div>
              <button 
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  saving
                    ? 'bg-gray-500 text-white cursor-not-allowed'
                    : 'bg-[#EAFE07] text-black hover:bg-yellow-300'
                }`}
                onClick={handleSaveMission}
                disabled={saving}
              >
                {saving ? 'Saving...' : '💾 Save Mission'}
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Indicador de piso en Primera Persona */}
      {viewMode === 'firstPerson' && cameraRef.current && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-gradient-to-r from-[#EAFE07]/90 to-yellow-400/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
            <div className="flex items-center space-x-3">
              <div>
                <div className="text-[#0042A6] font-bold text-lg leading-none">
                  Floor {currentFloor}
                </div>
                <div className="text-[#0042A6] text-xs opacity-75">
                  {cameraRef.current.position.y.toFixed(2)}m
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de controles de teclado */}
      {viewMode === 'firstPerson' && (
        <div className="fixed bottom-6 left-64 z-50">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2 flex items-center space-x-3">
            {/* WASD en formación de teclado */}
            <div className="flex flex-col items-center space-y-1">
              <kbd className="w-7 h-7 bg-white/20 rounded text-center flex items-center justify-center font-mono text-xs text-white border border-white/30">W</kbd>
              <div className="flex space-x-1">
                <kbd className="w-7 h-7 bg-white/20 rounded text-center flex items-center justify-center font-mono text-xs text-white border border-white/30">A</kbd>
                <kbd className="w-7 h-7 bg-white/20 rounded text-center flex items-center justify-center font-mono text-xs text-white border border-white/30">S</kbd>
                <kbd className="w-7 h-7 bg-white/20 rounded text-center flex items-center justify-center font-mono text-xs text-white border border-white/30">D</kbd>
              </div>
            </div>
            
            <div className="w-px h-12 bg-white/30"></div>
            
            {/* Q/E para pisos */}
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-1.5">
                <kbd className="w-7 h-7 bg-[#EAFE07]/20 rounded text-center flex items-center justify-center font-mono text-xs text-[#EAFE07] border border-[#EAFE07]/50">E</kbd>
                <span className="text-[9px] text-gray-400 w-9">Up</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <kbd className="w-7 h-7 bg-[#EAFE07]/20 rounded text-center flex items-center justify-center font-mono text-xs text-[#EAFE07] border border-[#EAFE07]/50">Q</kbd>
                <span className="text-[9px] text-gray-400 w-9">Down</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Indicador de controles para Vista Top */}
      {viewMode === 'top' && (
        <div className="fixed top-24 left-60 z-50">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2.5 flex items-center space-x-3 text-xs text-white">
            <span className="text-gray-300">Click + Drag: Pan</span>
            <div className="w-px h-5 bg-white/30"></div>
            <span className="text-gray-300">Scroll: Zoom</span>
            <div className="w-px h-5 bg-white/30"></div>
            <span className="text-gray-400 italic">Rotation: Y-axis</span>
          </div>
        </div>
      )}
      
      {/* Panel de detalles */}
      <ModuleDetailsPanel 
        selectedModule={selectedModule} 
        onClose={() => setSelectedModule(null)}
        onReset={resetModulePosition}
        onMoveToFloor={moveToFloor}
        getCurrentFloor={getCurrentFloor}
      />
    </>
  );
}

// Componente principal
export default function ModuleViewer3D() {
  const searchParams = useSearchParams();
  const [modulesConfig, setModulesConfig] = useState<ArkhaModulesConfig | null>(null);
  const [missionLayout, setMissionLayout] = useState<MissionLayout | null>(null);
  const [savedModules, setSavedModules] = useState<Array<{
    id: string;
    moduleConfigId: string;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
  }> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false); // Nuevo estado para controlar cuando mostrar el Canvas
  const [loadingMessage, setLoadingMessage] = useState('Initializing ARKHA...');
  const [loadingProgress, setLoadingProgress] = useState(0); // Progreso 0-100
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false); // Estado para el guardado

  // Generar posiciones fijas para las estrellas (evitar hydration error)
  // IMPORTANTE: Debe estar FUERA del condicional para evitar "hooks" error
  const stars = React.useMemo(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: (i * 37.5) % 100, // Distribución pseudo-aleatoria pero fija
      top: (i * 73.2) % 100,
      delay: (i * 0.04) % 2,
      duration: 2 + (i % 3),
      opacity: 0.3 + ((i * 0.014) % 0.7)
    }))
  , []);

  useEffect(() => {
    const loadEverything = async () => {
      try {
        setLoading(true);
        setIsReady(false); // Reset ready state
        setError(null);
        setLoadingProgress(0);
        
        // 1. Cargar configuración base de módulos
        setLoadingMessage('Loading module configuration...');
        setLoadingProgress(10);
        const config = await ModuleConfigService.getInstance().getModulesConfig();
        if (!config) {
          throw new Error('Could not load module configuration');
        }
        setModulesConfig(config);
        setLoadingProgress(25);
        
        // 2. Verificar si hay parámetros de misión en la URL
        const missionIdParam = searchParams?.get('missionId');
        const passengersParam = searchParams?.get('passengers');
        const durationParam = searchParams?.get('duration');
        const terrainParam = searchParams?.get('terrain');
        
        // Decidir qué cargar basado en los parámetros
        if (passengersParam && durationParam && terrainParam) {
          // NUEVA MISIÓN: Tiene parámetros de creación → Llamar microservicio
          setLoadingMessage('Generating mission layout from microservice...');
          setLoadingProgress(35);
          
          const layout = await MissionLayoutService.getInstance().generateMissionLayout({
            passengers: parseInt(passengersParam),
            duration: parseInt(durationParam),
            terrain: terrainParam as 'moon' | 'mars' | 'asteroid',
            isScientific: searchParams?.get('isScientific') === 'true'
          });
          
          console.log('✅ Generated new mission layout:', layout);
          setMissionLayout(layout);
          setLoadingProgress(55);
        } else if (missionIdParam) {
          // MISIÓN EXISTENTE: Solo tiene missionId → Intentar cargar de base de datos
          setLoadingMessage('Loading saved modules...');
          setLoadingProgress(35);
          
          const { ModuleService } = await import('../application/services/ModuleService');
          const moduleService = new ModuleService();
          const modules = await moduleService.loadModules(missionIdParam);
          
          console.log('✅ Loaded saved modules:', modules);
          
          // Si NO tiene módulos guardados, generar layout desde microservicio
          if (!modules || modules.length === 0) {
            console.log('⚠️ No saved modules found, generating layout from microservice...');
            setLoadingMessage('Generating mission layout from microservice...');
            
            // Cargar los parámetros de la misión desde Supabase para el microservicio
            const { SupabaseMissionRepository } = await import('../infrastructure/repositories/SupabaseMissionRepository');
            const missionRepo = new SupabaseMissionRepository();
            const mission = await missionRepo.findById(missionIdParam);
            
            if (mission) {
              const layout = await MissionLayoutService.getInstance().generateMissionLayout({
                passengers: mission.passengers || 10,
                duration: mission.duration || 90,
                terrain: (mission.destination?.toLowerCase() || 'moon') as 'moon' | 'mars' | 'asteroid',
                isScientific: mission.isScientific || false
              });
              
              console.log('✅ Generated layout for existing mission:', layout);
              setMissionLayout(layout);
            }
          } else {
            setSavedModules(modules);
          }
          
          setLoadingProgress(55);
        } else {
          // Sin parámetros: Cargar configuración por defecto
          setLoadingProgress(50);
        }
        
        // 3. Precargar los modelos GLB específicos para evitar el "salto negro"
        setLoadingMessage('Loading 3D models...');
        setLoadingProgress(60);
        const modelsToLoad = missionLayout 
          ? missionLayout.modules.map(m => {
              const moduleConfig = config.modules.find(mc => mc.id === m.id);
              return moduleConfig?.path;
            }).filter(Boolean)
          : config.modules.filter(m => !m.hidden).map(m => m.path);
        
        // Precargar modelos y dar tiempo para que realmente se carguen
        modelsToLoad.slice(0, 5).forEach(path => {
          if (path) {
            useGLTF.preload(path);
          }
        });
        
        setLoadingProgress(75);
        
        // Esperar mientras los modelos se cargan - actualizar progreso
        const loadingSteps = 8;
        for (let i = 0; i < loadingSteps; i++) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setLoadingProgress(75 + (i + 1) * 2); // 75 -> 91
        }
        
        // 4. Preparar escena 3D
        setLoadingMessage('Preparing 3D scene...');
        setLoadingProgress(95);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Todo listo, ahora sí mostrar el Canvas
        setLoadingProgress(100);
        setIsReady(true);
        
      } catch (err) {
        console.error('❌ Error cargando:', err);
        setError(err instanceof Error ? err.message : 'Error loading configuration');
      } finally {
        setLoading(false);
      }
    };

    loadEverything();
  }, [searchParams]);

  // Mostrar loader mientras carga O mientras no esté listo
  if (loading || !isReady) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black relative overflow-hidden">
        {/* Estrellas de fondo animadas */}
        <div className="absolute inset-0">
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
                opacity: star.opacity
              }}
            />
          ))}
        </div>

        {/* Contenedor principal del loader */}
        <motion.div 
          className="relative z-10 w-full max-w-2xl px-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo ARKHA */}
          <div className="text-center mb-12">
            <motion.div 
              className="inline-flex items-center justify-center w-32 h-32 mb-6"
              animate={{ 
                scale: [1, 1.05, 1],
                y: [0, -10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <img 
                src="/icono-arkha-blanco.png" 
                alt="ARKHA Logo" 
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </motion.div>
            <h1 className="text-5xl font-black text-white mb-3 tracking-tight">
              ARKHA
            </h1>
            <p className="text-[#EAFE07] text-lg font-medium">Space Mission Builder</p>
          </div>

          {/* Barra de progreso moderna */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <p className="text-white text-lg font-semibold">{loadingMessage}</p>
              <span className="text-[#EAFE07] font-bold text-xl">{loadingProgress}%</span>
            </div>
            
            {/* Barra de progreso con gradiente */}
            <div className="relative h-4 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/20">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-gray-600 via-gray-400 to-[#EAFE07] rounded-full shadow-lg"
                initial={{ width: 0 }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
              {/* Efecto de brillo animado */}
              <motion.div
                className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ['-100%', '400%']
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>
          </div>

          {/* Indicadores de progreso detallados */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Config', threshold: 25 },
              { label: 'Layout', threshold: 55 },
              { label: 'Models', threshold: 75 },
              { label: 'Scene', threshold: 95 }
            ].map((step, index) => (
              <motion.div
                key={index}
                className={`text-center p-3 rounded-lg border-2 transition-all duration-300 ${
                  loadingProgress >= step.threshold
                    ? 'bg-[#EAFE07]/20 border-[#EAFE07] text-[#EAFE07]'
                    : 'bg-white/5 border-white/20 text-white/50'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-xs font-semibold mb-1">{step.label}</div>
                {loadingProgress >= step.threshold ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-lg"
                  >
                    ✓
                  </motion.div>
                ) : (
                  <div className="w-4 h-4 border-2 border-current rounded-full mx-auto animate-pulse" />
                )}
              </motion.div>
            ))}
          </div>

          {/* Mensaje adicional */}
          <motion.p 
            className="text-center text-gray-400 text-sm"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Preparing your lunar base experience...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error || !modulesConfig) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#EAFE07] text-black px-6 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Extraer missionId de la URL
  const missionId = searchParams?.get('missionId') || null;

  return <ModuleScene 
    modulesConfig={modulesConfig} 
    missionLayout={missionLayout} 
    savedModules={savedModules} 
    missionId={missionId} 
    saving={saving} 
    setSaving={setSaving}
    searchParams={searchParams}
    setMissionLayout={setMissionLayout}
    setSavedModules={setSavedModules}
  />;
}

// Precargar modelos para mejor rendimiento
useGLTF.preload('/models/extraterrestrial_lands/SRF_MOON.glb');
useGLTF.preload('/models/modules/ARKHA_AccessCore_L1_V1.glb');
useGLTF.preload('/models/modules/ARKHA_LabTri_L2_V1.glb');
