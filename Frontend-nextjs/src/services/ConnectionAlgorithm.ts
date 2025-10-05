// ALGORITMO UNIVERSAL DE CONEXIÓN DE MÓDULOS
// Optimizado y minimizado para máxima eficiencia

export interface Anclaje {
  id: string;
  tipo: 'interconexión_vertical' | 'interconexión_horizontal';
  radio: number;
  posicion: [number, number, number];
  direccion: [number, number, number];
  arriba: [number, number, number];
  compatible: string[];
}

export interface Conexion {
  compatible: boolean;
  traslacion: [number, number, number];
  rotacion: number;
  distancia: number;
  error?: string;
}

export interface ConfiguracionConexion {
  moduloOrigen: string;
  anclajeOrigen: string;
  moduloDestino: string;
  anclajeDestino: string;
  nombre?: string;
}

/**
 * ALGORITMO UNIVERSAL DE CONEXIÓN
 * Calcula la traslación y rotación necesaria para conectar dos anclajes
 */
export class ConnectionAlgorithm {
  
  /**
   * Verifica si dos anclajes son compatibles
   * Compatibilidad = direcciones opuestas
   */
  static sonCompatibles(anclaje1: Anclaje, anclaje2: Anclaje): boolean {
    const d1 = anclaje1.direccion;
    const d2 = anclaje2.direccion;
    return d1[0] === -d2[0] && d1[1] === -d2[1] && d1[2] === -d2[2];
  }

  /**
   * Calcula la traslación necesaria para conectar dos anclajes
   */
  static calcularTraslacion(anclaje1: Anclaje, anclaje2: Anclaje): [number, number, number] {
    return [
      anclaje2.posicion[0] - anclaje1.posicion[0],
      anclaje2.posicion[1] - anclaje1.posicion[1],
      anclaje2.posicion[2] - anclaje1.posicion[2]
    ];
  }

  /**
   * Calcula la rotación necesaria para alinear vectores "arriba"
   */
  static calcularRotacion(anclaje1: Anclaje, anclaje2: Anclaje): number {
    const a1 = anclaje1.arriba;
    const a2 = anclaje2.arriba;
    const dot = a1[0] * a2[0] + a1[1] * a2[1] + a1[2] * a2[2];
    return Math.acos(Math.max(-1, Math.min(1, dot))) * (180 / Math.PI);
  }

  /**
   * ALGORITMO PRINCIPAL: Conecta dos anclajes
   */
  static conectar(anclaje1: Anclaje, anclaje2: Anclaje): Conexion {
    // 1. Verificar compatibilidad
    if (!this.sonCompatibles(anclaje1, anclaje2)) {
      return {
        compatible: false,
        traslacion: [0, 0, 0],
        rotacion: 0,
        distancia: 0,
        error: `Direcciones incompatibles: ${anclaje1.direccion.join(',')} vs ${anclaje2.direccion.join(',')}`
      };
    }

    // 2. Calcular traslación
    const traslacion = this.calcularTraslacion(anclaje1, anclaje2);
    
    // 3. Calcular rotación
    const rotacion = this.calcularRotacion(anclaje1, anclaje2);
    
    // 4. Calcular distancia
    const distancia = Math.sqrt(traslacion[0]**2 + traslacion[1]**2 + traslacion[2]**2);

    return {
      compatible: true,
      traslacion,
      rotacion,
      distancia
    };
  }

  /**
   * Aplica la conexión a un módulo
   */
  static aplicarConexion(
    posicionOriginal: [number, number, number],
    rotacionOriginal: [number, number, number],
    conexion: Conexion
  ): { posicion: [number, number, number], rotacion: [number, number, number] } {
    if (!conexion.compatible) {
      return { posicion: posicionOriginal, rotacion: rotacionOriginal };
    }

    return {
      posicion: [
        posicionOriginal[0] + conexion.traslacion[0],
        posicionOriginal[1] + conexion.traslacion[1],
        posicionOriginal[2] + conexion.traslacion[2]
      ],
      rotacion: [
        rotacionOriginal[0],
        rotacionOriginal[1] + conexion.rotacion,
        rotacionOriginal[2]
      ]
    };
  }
}

/**
 * FUNCIÓN GLOBAL: Conecta cualquier anclaje con cualquier otro
 */
export function conectarAnclajes(
  anclajeOrigen: Anclaje, 
  anclajeDestino: Anclaje,
  nombreConexion?: string
): Conexion {
  const conexionName = nombreConexion || `${anclajeOrigen.id} ↔ ${anclajeDestino.id}`;
  console.log(`\n🔗 CONECTANDO ${conexionName}`);
  
  const conexion = ConnectionAlgorithm.conectar(anclajeOrigen, anclajeDestino);
  
  if (conexion.compatible) {
    console.log(`✅ COMPATIBLES`);
    console.log(`  Traslación: [${conexion.traslacion.map(v => v.toFixed(2)).join(', ')}]`);
    console.log(`  Rotación: ${conexion.rotacion.toFixed(2)}°`);
    console.log(`  Distancia: ${conexion.distancia.toFixed(2)}`);
  } else {
    console.log(`❌ INCOMPATIBLES: ${conexion.error}`);
  }
  
  return conexion;
}

/**
 * SISTEMA DE CONEXIONES MÚLTIPLES
 * Permite definir y ejecutar múltiples conexiones
 */
export class SistemaConexiones {
  private conexiones: ConfiguracionConexion[] = [];
  private modulos: Map<string, Anclaje[]> = new Map();

  /**
   * Registra un módulo con sus anclajes
   */
  registrarModulo(idModulo: string, anclajes: Anclaje[]): void {
    this.modulos.set(idModulo, anclajes);
    console.log(`📦 Módulo ${idModulo} registrado con ${anclajes.length} anclajes`);
  }

  /**
   * Define una conexión entre dos anclajes
   */
  definirConexion(configuracion: ConfiguracionConexion): void {
    this.conexiones.push(configuracion);
    console.log(`🔗 Conexión definida: ${configuracion.moduloOrigen}.${configuracion.anclajeOrigen} ↔ ${configuracion.moduloDestino}.${configuracion.anclajeDestino}`);
  }

  /**
   * Ejecuta todas las conexiones definidas
   */
  ejecutarConexiones(): Map<string, { posicion: [number, number, number], rotacion: [number, number, number] }> {
    const resultados = new Map();
    
    console.log(`\n🚀 EJECUTANDO ${this.conexiones.length} CONEXIONES`);
    
    for (const conexion of this.conexiones) {
      const anclajesOrigen = this.modulos.get(conexion.moduloOrigen);
      const anclajesDestino = this.modulos.get(conexion.moduloDestino);
      
      if (!anclajesOrigen || !anclajesDestino) {
        console.log(`❌ Módulos no encontrados: ${conexion.moduloOrigen} o ${conexion.moduloDestino}`);
        continue;
      }
      
      const anclajeOrigen = anclajesOrigen.find(a => a.id === conexion.anclajeOrigen);
      const anclajeDestino = anclajesDestino.find(a => a.id === conexion.anclajeDestino);
      
      if (!anclajeOrigen || !anclajeDestino) {
        console.log(`❌ Anclajes no encontrados: ${conexion.anclajeOrigen} o ${conexion.anclajeDestino}`);
        continue;
      }
      
      const resultado = conectarAnclajes(anclajeOrigen, anclajeDestino, conexion.nombre);
      
      if (resultado.compatible) {
        // Aplicar la conexión al módulo destino
        const posicionOriginal = [0, 0, 0] as [number, number, number];
        const rotacionOriginal = [0, 0, 0] as [number, number, number];
        
        const posicionFinal = ConnectionAlgorithm.aplicarConexion(
          posicionOriginal,
          rotacionOriginal,
          resultado
        );
        
        resultados.set(conexion.moduloDestino, {
          posicion: posicionFinal.posicion,
          rotacion: posicionFinal.rotacion
        });
        
        console.log(`✅ Conexión aplicada a ${conexion.moduloDestino}: [${posicionFinal.posicion.map(v => v.toFixed(2)).join(', ')}]`);
      }
    }
    
    return resultados;
  }

  /**
   * Limpia todas las conexiones
   */
  limpiar(): void {
    this.conexiones = [];
    this.modulos.clear();
    console.log(`🧹 Sistema de conexiones limpiado`);
  }
}

/**
 * FUNCIÓN DE UTILIDAD: Conecta anclaje C con anclaje D (ejemplo específico)
 */
export function conectarC_D(anclajeC: Anclaje, anclajeD: Anclaje): Conexion {
  return conectarAnclajes(anclajeC, anclajeD, "C ↔ D");
}
