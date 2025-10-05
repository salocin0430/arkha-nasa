// EJEMPLO DE USO DEL SISTEMA GLOBAL DE CONEXIONES
// Este archivo muestra cómo usar el sistema para conectar cualquier anclaje con cualquier otro

import { SistemaConexiones, ConfiguracionConexion } from '@/services/ConnectionAlgorithm';

/**
 * EJEMPLO: Cómo usar el sistema global de conexiones
 */
export function ejemploUsoGlobal() {
  console.log('\n🚀 EJEMPLO DE SISTEMA GLOBAL DE CONEXIONES');
  
  // 1. Crear instancia del sistema
  const sistema = new SistemaConexiones();
  
  // 2. Registrar módulos con sus anclajes
  const anclajesModulo1 = [
    {
      id: 'anclaje_A',
      tipo: 'interconexión_vertical' as const,
      radio: 0.2,
      posicion: [0, -2, 0] as [number, number, number],
      direccion: [0, -1, 0] as [number, number, number],
      arriba: [0, 0, 1] as [number, number, number],
      compatible: ['habitat', 'lab', 'storage', 'power', 'life_support']
    },
    {
      id: 'anclaje_C',
      tipo: 'interconexión_horizontal' as const,
      radio: 0.2,
      posicion: [2, 0, 0] as [number, number, number],
      direccion: [1, 0, 0] as [number, number, number],
      arriba: [0, 1, 0] as [number, number, number],
      compatible: ['habitat', 'lab', 'storage', 'power', 'life_support']
    }
  ];
  
  const anclajesModulo2 = [
    {
      id: 'anclaje_B',
      tipo: 'interconexión_vertical' as const,
      radio: 0.2,
      posicion: [0, 2, 0] as [number, number, number],
      direccion: [0, 1, 0] as [number, number, number],
      arriba: [0, 0, 1] as [number, number, number],
      compatible: ['habitat', 'lab', 'storage', 'power', 'life_support']
    },
    {
      id: 'anclaje_D',
      tipo: 'interconexión_horizontal' as const,
      radio: 0.2,
      posicion: [-2, 0, 0] as [number, number, number],
      direccion: [-1, 0, 0] as [number, number, number],
      arriba: [0, 1, 0] as [number, number, number],
      compatible: ['habitat', 'lab', 'storage', 'power', 'life_support']
    }
  ];
  
  // 3. Registrar módulos
  sistema.registrarModulo('modulo_1', anclajesModulo1);
  sistema.registrarModulo('modulo_2', anclajesModulo2);
  
  // 4. Definir conexiones (puedes conectar cualquier anclaje con cualquier otro)
  const conexiones: ConfiguracionConexion[] = [
    {
      moduloOrigen: 'modulo_1',
      anclajeOrigen: 'anclaje_C',
      moduloDestino: 'modulo_2',
      anclajeDestino: 'anclaje_D',
      nombre: 'Conexión C-D'
    },
    {
      moduloOrigen: 'modulo_1',
      anclajeOrigen: 'anclaje_A',
      moduloDestino: 'modulo_2',
      anclajeDestino: 'anclaje_B',
      nombre: 'Conexión A-B'
    }
  ];
  
  // 5. Definir todas las conexiones
  conexiones.forEach(conexion => {
    sistema.definirConexion(conexion);
  });
  
  // 6. Ejecutar todas las conexiones
  const resultados = sistema.ejecutarConexiones();
  
  // 7. Mostrar resultados
  console.log('\n📊 RESULTADOS DE CONEXIONES:');
  resultados.forEach((resultado, moduloId) => {
    console.log(`  ${moduloId}: [${resultado.posicion.map(v => v.toFixed(2)).join(', ')}]`);
  });
  
  return resultados;
}

/**
 * EJEMPLO: Cómo conectar anclajes específicos
 */
export function ejemploConexionEspecifica() {
  console.log('\n🎯 EJEMPLO DE CONEXIÓN ESPECÍFICA');
  
  // Puedes conectar cualquier anclaje con cualquier otro
  const anclajeA = {
    id: 'anclaje_A',
    tipo: 'interconexión_vertical' as const,
    radio: 0.2,
    posicion: [0, -2, 0] as [number, number, number],
    direccion: [0, -1, 0] as [number, number, number],
    arriba: [0, 0, 1] as [number, number, number],
    compatible: ['habitat', 'lab', 'storage', 'power', 'life_support']
  };
  
  const anclajeB = {
    id: 'anclaje_B',
    tipo: 'interconexión_vertical' as const,
    radio: 0.2,
    posicion: [0, 2, 0] as [number, number, number],
    direccion: [0, 1, 0] as [number, number, number],
    arriba: [0, 0, 1] as [number, number, number],
    compatible: ['habitat', 'lab', 'storage', 'power', 'life_support']
  };
  
  // Conectar A con B
  const sistema = new SistemaConexiones();
  sistema.registrarModulo('modulo_1', [anclajeA]);
  sistema.registrarModulo('modulo_2', [anclajeB]);
  
  sistema.definirConexion({
    moduloOrigen: 'modulo_1',
    anclajeOrigen: 'anclaje_A',
    moduloDestino: 'modulo_2',
    anclajeDestino: 'anclaje_B',
    nombre: 'Conexión A-B'
  });
  
  const resultados = sistema.ejecutarConexiones();
  return resultados;
}
