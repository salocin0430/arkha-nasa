"""
===============================================================================
ALGORITMO DE ORDENACIÓN INTELIGENTE DE ARKAS - FASE 2
===============================================================================

Este módulo implementa un algoritmo avanzado para colocar módulos en arkas
espaciales respetando restricciones y optimizando prioridades.

ESTRUCTURA DEL SISTEMA:
- Arka: Matriz 4x4 (4 pisos x 4 caras por piso)
- Módulo: Cada posición puede contener un módulo específico
- Restricciones: Reglas que prohíben ciertas combinaciones de módulos
- Prioridades: Reglas que favorecen ciertas combinaciones de módulos

ALGORITMO PRINCIPAL:
1. Ordenar módulos por prioridad de colocación
2. Para cada módulo, encontrar la mejor posición usando scoring
3. Colocar en arkas existentes o crear nuevas según sea necesario
4. Validar restricciones en tiempo real

SISTEMA DE SCORING:
- +10 puntos por cada prioridad satisfecha con módulos horizontalmente adyacentes
- +15 puntos por estar en piso prioritario (si está definido)
- -5 puntos por cada piso inferior incompleto (incentiva completar de abajo hacia arriba)
- +1 punto por cada espacio horizontalmente adyacente vacío (flexibilidad futura)

AUTOR: Sistema de Gestión de Módulos ARKHA
VERSIÓN: 2.0
"""

import Fase1
from typing import List, Tuple, Dict, Optional

# =============================================================================
# CONTADOR GLOBAL DE ARKAS
# =============================================================================
contador_arkas = 0

'''
MODULOS_INFO = {
    "001": "ARKHA_base_L1_V1",      
    "002": "ARKHA_LabTri_L2_V1",  
    "003": "ARKHA_Lab_L2_V1",       
    "004": "ARKHA_PowerCore_L1_V1",
    "005": "ARKHA_RecreacionTri_L1_V1",
    "006": "ARKHA_Recreacion_L1_V1",
    "007": "ARKHA_HuertaTri_L1_V1",
    "008": "ARKHA_Huerta_L1_V1",
    "009": "ARKHA_Circulacion_L1_V1",
    "010": "ARKHA_AccessCore_L1_V1",
    "011": "ARKHA_TransCore_L2_V1",
    "012": "ARKHA_SanitaryBay_L2_V1",
    "013": "ARKHA_SanitaryBayTri_L2_V1",
    "014": "ARKHA_L2_ExerciseBay_V1",
    "015": "ARKHA_L2_ExerciseBayTri_V1",
    "016": "ARKHA_L2_SystemsBay_V1",
    "017": "ARKHA_L2_SystemsBayTri_V1",
    "018": "ARKHA_L2_StorageBay_V1",
    "019": "ARKHA_L2_StorageBayTri_V1",
    "020": "ARKHA_L3_GalleyComputerBay_V1",
    "021": "ARKHA_L3_GalleyComputerBayTri_V1",
    "022": "ARKHA_L3_MealPrepBay_V1",
    "023": "ARKHA_L3_MealPrepBayTri_V1",
    "024": "ARKHA_L3_MedBay_V1",
    "025": "ARKHA_L3_MedBayTri_V1",
    "026": "ARKHA_L2_SleepWardBay_V1",
    "027": "ARKHA_L2_SleepWardBayTri_V1",
}


Evitar:
(002, 012), (002, 013), (002, 026), (002, 027)
(013, 002), (013, 003)
(027, 002), (027, 003)






Evitar:
'''

# =============================================================================
# SISTEMA DE RESTRICCIONES PROHIBIDAS
# =============================================================================
# Estas son las reglas que NUNCA se pueden violar.
# Definen qué módulos NO pueden estar adyacentes entre sí.
# Formato: (módulo_origen, módulo_destino) - la restricción es UNIDIRECCIONAL
# IMPORTANTE: Solo se verifica la dirección específica definida en la lista

restricciones_prohibidas = [
    # Desde LAB Tri (002) evita Sanitary y Sleep
    ("002", "012"),
    ("002", "013"),
    ("002", "026"),
    ("002", "027"),

    # Bidireccionalidad: Sanitary Tri evita LAB (normal y tri)
    ("013", "003"),
    ("013", "002"),

    # Bidireccionalidad: Sleep Tri evita LAB (normal y tri)
    ("027", "003"),
    ("027", "002"),
    
    # Sanitary Tri evita Cocina
    ("013", "022"),
    ("013", "023"),

    # Cocina Tri evita Sanitary
    ("023", "012"),
    ("023", "013"),
    
    # Desde Exercise Tri evita Sleepingarea y Medical
    ("015", "026"),
    ("015", "027"),
    ("015", "024"),
    ("015", "025"),

    # Bidireccionalidad: Sleepingarea Tri evita Exercise
    ("027", "014"),
    ("027", "015"),

    # Bidireccionalidad: Medical Tri evita Exercise
    ("025", "014"),
    ("025", "015"),
    
     # Desde SystemBay Tri evita Sleepingarea y Medical
    ("017", "026"),
    ("017", "027"),
    ("017", "024"),
    ("017", "025"),

    # Bidireccionalidad: Sleepingarea Tri evita SystemBay
    ("027", "016"),
    ("027", "017"),

    # Bidireccionalidad: Medical Tri evita SystemBay
    ("025", "016"),
    ("025", "017"),
    
    # StorageBay Tri evita Sleepingarea
    ("019", "026"),
    ("019", "027"),

    # Sleepingarea Tri evita StorageBay
    ("027", "018"),
    ("027", "019"),
    
    # GalleyComputerBay Tri evita SanitaryBay
    ("021", "012"),
    ("021", "013"),

    # SanitaryBay Tri evita GalleyComputerBay
    ("013", "020"),
    ("013", "021"),
    
    # MedBay Tri evita Exercise, Sanitary, MealPrep
    ("025", "014"),
    ("025", "015"),
    ("025", "012"),
    ("025", "013"),
    ("025", "022"),
    ("025", "023"),

    # Bidireccionalidad: Exercise Tri evita MedBay
    ("015", "024"),
    ("015", "025"),

    # Bidireccionalidad: Sanitary Tri evita MedBay
    ("013", "024"),
    ("013", "025"),

    # Bidireccionalidad: MealPrep Tri evita MedBay
    ("023", "024"),
    ("023", "025"),
]

# =============================================================================
# SISTEMA DE PISOS PRIORITARIOS
# =============================================================================
# Define qué pisos son preferidos para ciertos módulos.
# Algunos módulos funcionan mejor en pisos específicos por su función.
# Formato: {módulo_id: [lista_de_pisos_preferidos]}

pisos_prioritarios = {
    # Módulos de recreación prefieren pisos superiores 
    "005": [1, 2, 3],  # Recreation Tri - pisos 3, 4 y 5
    "006": [1, 2, 3],  # Recreation normal - pisos 3, 4 y 5
    
    "007": [0, 1],  # Huerta Tri - pisos 3, 4 y 5
    "008": [0, 1],  # Huerta normal - pisos 3, 4 y 5

    "012": [1], # Sanitary Bay Tri - pisos 2
    "013": [1], # Sanitary Bay normal - pisos 2
    
    "014": [0], # Exercise Tri - pisos 2
    "015": [0], # Exercise normal - pisos 2
    
    "016": [0], # Systems Bay Tri - pisos 2
    "017": [0], # Systems Bay normal - pisos 2
    
    "018": [0], # Storage Bay Tri - pisos 2
    "019": [0], # Storage Bay normal - pisos 2
    
    "022": [1], # Meal Prep Tri - pisos 2
    "023": [1], # Meal Prep normal - pisos 2
    
    "026": [3], # Sleepingarea Tri - pisos 5
    "027": [3], # Sleepingarea normal - pisos 5

}



# =============================================================================
# SISTEMA DE PRIORIDADES DE COLOCACIÓN
# =============================================================================
# Estas son las reglas que FAVORECEN ciertas combinaciones de módulos.
# Cuando dos módulos con prioridad están adyacentes, se otorgan puntos bonus.
# Formato: (módulo_origen, módulo_destino) - la prioridad es bidireccional

prioridades = [
    
     # LAB Tri prefiere estar cerca de:
    ("002", "014"),  # Workstation normal
    ("002", "015"),  # Workstation Tri
    ("002", "016"),  # SystemsBay normal
    ("002", "017"),  # SystemsBay Tri
    ("002", "024"),  # Medical normal
    ("002", "025"),  # Medical Tri
    ("002", "003"),  # Labs normal
    ("002", "002"),  # Labs Tri (auto-preferencia)

    # Bidireccionalidad: Tri del otro tipo prefiere LAB Tri
    ("015", "002"),  # Workstation Tri
    ("017", "002"),  # SystemsBay Tri
    ("025", "002"),  # Medical Tri
    
    # Nuevas: Tri del otro tipo también prefiere LAB normal
    ("015", "003"),  # Workstation Tri hacia Lab normal
    ("017", "003"),  # SystemsBay Tri hacia Lab normal
    ("025", "003"),  # Medical Tri hacia Lab normal
    
    # Recreation Tri prefiere estar cerca de:
    ("005", "006"),  # Recreation normal
    ("005", "005"),  # Recreation Tri (auto-preferencia)
    ("005", "022"),  # MealPrep normal
    ("005", "023"),  # MealPrep Tri
    ("005", "026"),  # Sleepingarea normal
    ("005", "027"),  # Sleepingarea Tri

    # Bidireccionalidad: Tri del otro tipo prefiere Recreation Tri
    ("023", "005"),  # MealPrep Tri
    ("027", "005"),  # Sleepingarea Tri

    # Tri del otro tipo prefiere Recreation normal
    ("023", "006"),  # MealPrep Tri hacia Recreation normal
    ("027", "006"),  # Sleepingarea Tri hacia Recreation normal
    
    # Huerta Tri prefiere estar cerca de:
    ("007", "008"),  # Huerta normal
    ("007", "007"),  # Huerta Tri (auto-preferencia)
    ("007", "018"),  # StorageBay normal
    ("007", "019"),  # StorageBay Tri

    # Bidireccionalidad: Tri del otro tipo prefiere Huerta Tri
    ("019", "007"),  # StorageBay Tri

    # Tri del otro tipo prefiere Huerta normal
    ("019", "008"),  # StorageBay Tri hacia Huerta normal
    
    # Sanitary Tri prefiere estar cerca de ExerciseBay
    ("013", "014"),  # Exercise normal
    ("013", "015"),  # Exercise Tri

    # Bidireccionalidad: Exercise Tri prefiere Sanitary Tri
    ("015", "013"),

    # Tri del otro tipo prefiere Sanitary normal
    ("015", "012"),
    
    # GalleyComputerBay Tri prefiere estar cerca de:
    ("021", "020"),  # GalleyComputerBay normal
    ("021", "021"),  # GalleyComputerBay Tri (auto-preferencia)
    ("021", "022"),  # MealPrep normal
    ("021", "023"),  # MealPrep Tri
    ("021", "026"),  # Sleepingarea normal
    ("021", "027"),  # Sleepingarea Tri

    # Bidireccionalidad: Tri del otro tipo prefiere GalleyComputerBay Tri
    ("023", "021"),  # MealPrep Tri
    ("027", "021"),  # Sleepingarea Tri

    # Tri del otro tipo prefiere GalleyComputerBay normal
    ("023", "020"),  # MealPrep Tri hacia GalleyComputerBay normal
    ("027", "020"),  # Sleepingarea Tri hacia GalleyComputerBay normal
    
    # MealPrep Tri prefiere estar cerca de:
    ("023", "022"),  # MealPrep normal
    ("023", "023"),  # MealPrep Tri (auto-preferencia)
    ("023", "018"),  # StorageBay normal
    ("023", "019"),  # StorageBay Tri
    ("023", "020"),  # GalleyComputerBay normal
    ("023", "021"),  # GalleyComputerBay Tri
    ("023", "008"),  # Huerta normal
    ("023", "007"),  # Huerta Tri

    # Bidireccionalidad: Tri del otro tipo prefiere MealPrep Tri
    ("019", "023"),  # StorageBay Tri
    ("021", "023"),  # GalleyComputerBay Tri
    ("007", "023"),  # Huerta Tri

    # Tri del otro tipo prefiere MealPrep normal
    ("019", "022"),  # StorageBay Tri hacia MealPrep normal
    ("021", "022"),  # GalleyComputerBay Tri hacia MealPrep normal
    ("007", "022"),  # Huerta Tri hacia MealPrep normal
    
    # MedBay Tri prefiere estar cerca de:
    ("025", "024"),  # MedBay normal
    ("025", "025"),  # MedBay Tri (auto-preferencia)
    ("025", "016"),  # SystemsBay normal
    ("025", "017"),  # SystemsBay Tri
    ("025", "018"),  # StorageBay normal
    ("025", "019"),  # StorageBay Tri

    # Bidireccionalidad: Tri del otro tipo prefiere MedBay Tri
    ("017", "025"),  # SystemsBay Tri
    ("019", "025"),  # StorageBay Tri

    # Tri del otro tipo prefiere MedBay normal
    ("017", "024"),  # SystemsBay Tri hacia MedBay normal
    ("019", "024"),  # StorageBay Tri hacia MedBay normal
]

pisos_arka = {
    "1":4,
    "2":3,
    "3":3,
    "4":2,
    "0":4,
}

# =============================================================================
# FUNCIONES PRINCIPALES DEL ALGORITMO
# =============================================================================

"""
ESTRUCTURA DE DATOS:
- Arka: Lista de 4 pisos, cada piso tiene 4 caras
- Formato: arka[piso][cara] = modulo_id
- Piso 0-3, Cara 0-3 (índices base 0)
- None = posición vacía

EJEMPLO DE ARKA:
Piso 0: [Cara A] [Cara B] [Cara C] [Cara D]
Piso 1: [Cara A] [Cara B] [Cara C] [Cara D]  
Piso 2: [Cara A] [Cara B] [Cara C] [Cara D]
Piso 3: [Cara A] [Cara B] [Cara C] [Cara D]
"""


def nueva_arka():
    """
    Crea una nueva arka vacía (4x4) con número de arka y módulos de conexión reservados
    
    Estructura: 4 pisos x 4 caras por piso
    Reserva módulos 009 según la dirección actual y anterior
    Incrementa el contador global de arkas ANTES de asignar el número
    
    Returns:
        Dict: Diccionario con la arka y su número
    """
    global contador_arkas
    
    # Incrementar contador ANTES de asignar el número
    contador_arkas += 1
    numero_arka = contador_arkas
    
    pisos = pisos_arka[str(numero_arka%5)]
    # Obtener direcciones
    direccion_actual = direccion(numero_arka)
    direccion_anterior = None
    if numero_arka > 1:
        direccion_anterior = direccion(numero_arka - 1)
    
    # Crear matriz vacía
    arka = [[None for _ in range(4)] for _ in range(pisos)]
    
    # RESERVAR MÓDULOS SEGÚN DIRECCIÓN ACTUAL
    if direccion_actual == "ARRIBA":
        arka[1][2] = "009"  # Piso2Cara3
    elif direccion_actual == "IZQ":
        arka[1][3] = "009"  # Piso2Cara4
    elif direccion_actual == "ABAJO":
        arka[1][0] = "009"  # Piso2Cara1
    elif direccion_actual == "DER":
        arka[1][1] = "009"  # Piso2Cara2
    
    # RESERVAR MÓDULOS SEGÚN DIRECCIÓN ANTERIOR
    if direccion_anterior == "ARRIBA":
        arka[1][0] = "009"  # Piso2Cara1
    elif direccion_anterior == "IZQ":
        arka[1][1] = "009"  # Piso2Cara2
    elif direccion_anterior == "ABAJO":
        arka[1][2] = "009"  # Piso2Cara3
    elif direccion_anterior == "DER":
        arka[1][3] = "009"  # Piso2Cara4
    
    return {
        "numero": numero_arka,
        "matriz": arka,
        "direccion_actual": direccion_actual,
        "direccion_anterior": direccion_anterior,
        "pisos": pisos
    }

def cleaning_postresultado(arkas_resultado):
    """
    Método de limpieza post-resultado
    
    Realiza dos operaciones de limpieza:
    1. Limpia las conexiones de la última arka según su dirección
    2. Reemplaza todos los valores None (posiciones vacías) con módulo 006 (recreación)
    
    Args:
        arkas_resultado: Lista de arkas resultado
        
    Returns:
        List[Dict]: Lista de arkas con limpieza aplicada
    """
    if not arkas_resultado:
        print("No hay arkas en el resultado")
        return None
    
    # PASO 1: Limpiar conexiones de la última arka
    ultima_arka = arkas_resultado[-1]
    direccion_actual = ultima_arka["direccion_actual"]

    if direccion_actual == "ARRIBA":
        ultima_arka["matriz"][1][2] = None
    if direccion_actual == "IZQ":
        ultima_arka["matriz"][1][3] = None
    if direccion_actual == "ABAJO":
        ultima_arka["matriz"][1][0] = None
    if direccion_actual == "DER":
        ultima_arka["matriz"][1][1] = None

    arkas_resultado[-1] = ultima_arka
    
    # PASO 2: Barrida general - reemplazar todos los None con módulo 006 (recreación)
    print("=== APLICANDO LIMPIEZA GENERAL ===")
    espacios_rellenados = 0
    
    for arka_data in arkas_resultado:
        matriz = arka_data["matriz"]
        for piso in range(arka_data["pisos"]):
            for cara in range(4):
                if matriz[piso][cara] is None:
                    matriz[piso][cara] = "006"  # Módulo de recreación
                    espacios_rellenados += 1
                    print(f"Arka {arka_data['numero']}, Piso {piso+1}, Cara {cara+1}: Rellenado con módulo 006")
    
    print(f"Total de espacios rellenados con módulo 006: {espacios_rellenados}")
    print("=== LIMPIEZA COMPLETADA ===")
    
    return arkas_resultado

def direccion(n):
    if n < 1:
        raise ValueError("n debe ser >= 1")

    direcciones = ["ARRIBA", "IZQ", "ABAJO", "DER"]  # orden cíclico
    pasos = 1
    actual = 1
    dir_index = 0

    while True:
        for _ in range(2):  # dos veces cada longitud
            for _ in range(pasos):
                if actual == n:
                    return direcciones[dir_index]
                actual += 1
            dir_index = (dir_index + 1) % 4
        pasos += 1
        
def es_valida(arka_data, piso: int, cara: int, modulo_id: str) -> bool:
    """
    Verifica si es válido colocar un módulo en una posición específica
    
    Esta función es CRÍTICA porque verifica:
    1. Que la posición esté vacía
    2. Que no viole ninguna restricción con módulos horizontalmente adyacentes
    3. Regla especial para módulos sanitarios: solo pueden estar en piso 1+ si hay otro sanitario debajo
    
    IMPORTANTE: Solo verifica restricciones con módulos de IZQUIERDA y DERECHA
    - Cara 0 y Cara 3 son adyacentes entre sí (como un cilindro)
    - Módulos sanitarios (012, 013) requieren otro sanitario debajo si están en piso 1+
    
    Args:
        arka_data: Datos de la arka (puede ser matriz o diccionario)
        piso: Piso donde queremos colocar (0-3)
        cara: Cara donde queremos colocar (0-3)
        modulo_id: ID del módulo que queremos colocar
    
    Returns:
        bool: True si es válido colocar, False si no
    """
    # Obtener la matriz de la arka
    if isinstance(arka_data, dict):
        arka = arka_data["matriz"]
    else:
        arka = arka_data
    
    # PASO 1: Verificar que la posición esté vacía
    if arka[piso][cara] is not None:
        return False
    
    # PASO 2: Verificar restricciones SOLO con módulos horizontalmente adyacentes
    # Solo verificamos izquierda y derecha (no arriba, abajo, ni diagonales)
    
    # Módulo de la IZQUIERDA
    cara_izquierda = (cara - 1) % 4  # Cara 0 y 3 son adyacentes
    modulo_izquierda = arka[piso][cara_izquierda]
    if modulo_izquierda is not None:
        # Verificar restricciones con el módulo de la izquierda
        # Solo verificamos la dirección específica definida en la lista
        if (modulo_id, modulo_izquierda) in restricciones_prohibidas:
            return False
    
    # Módulo de la DERECHA
    cara_derecha = (cara + 1) % 4  # Cara 3 y 0 son adyacentes
    modulo_derecha = arka[piso][cara_derecha]
    if modulo_derecha is not None:
        # Verificar restricciones con el módulo de la derecha
        # Solo verificamos la dirección específica definida en la lista
        if (modulo_id, modulo_derecha) in restricciones_prohibidas:
            return False
    
    # PASO 3: Regla especial para módulos sanitarios
    # Los módulos sanitarios (012, 013) solo pueden estar en piso 1 o superior
    # si hay otro módulo sanitario justo debajo
    if modulo_id in ["012", "013"]:  # Módulos sanitarios
        if piso > 0:  # Si no está en el piso 0 (piso 1)
            # Verificar si hay un módulo sanitario justo debajo
            modulo_debajo = arka[piso - 1][cara]
            if modulo_debajo not in ["012", "013"]:  # Si no hay sanitario debajo
                return False
    
    return True  # Si llegamos aquí, es válido colocar el módulo

def calcular_score(arka_data, piso: int, cara: int, modulo_id: str) -> int:
    """
    Calcula el score de una posición para un módulo específico
    
    Esta función es el CORAZÓN del algoritmo de optimización.
    Evalúa qué tan "buena" es una posición para colocar un módulo.
    
    Sistema de puntuación:
    - +10 puntos por cada prioridad satisfecha con módulos horizontalmente adyacentes
    - +15 puntos por estar en piso prioritario (si está definido)
    - -5 puntos por cada piso inferior incompleto (incentiva completar de abajo hacia arriba)
    - +1 punto por cada espacio horizontalmente adyacente vacío (flexibilidad futura)
    
    IMPORTANTE: Solo considera módulos de IZQUIERDA y DERECHA
    - Cara 0 y Cara 3 son adyacentes entre sí (como un cilindro)
    
    Args:
        arka_data: Datos de la arka (puede ser matriz o diccionario)
        piso: Piso a evaluar (0-3)
        cara: Cara a evaluar (0-3)
        modulo_id: ID del módulo que queremos colocar
    
    Returns:
        int: Score de la posición (mayor = mejor)
    """
    # Obtener la matriz de la arka
    if isinstance(arka_data, dict):
        arka = arka_data["matriz"]
    else:
        arka = arka_data
    
    score = 0
    
    # PASO 1: Verificar prioridades SOLO con módulos horizontalmente adyacentes
    
    # Módulo de la IZQUIERDA
    cara_izquierda = (cara - 1) % 4  # Cara 0 y 3 son adyacentes
    modulo_izquierda = arka[piso][cara_izquierda]
    if modulo_izquierda is not None:
        # Verificar prioridades con el módulo de la izquierda
        if (modulo_id, modulo_izquierda) in prioridades:
            score += 10  # +10 puntos por prioridad satisfecha
        if (modulo_izquierda, modulo_id) in prioridades:
            score += 10  # +10 puntos por prioridad bidireccional
    
    # Módulo de la DERECHA
    cara_derecha = (cara + 1) % 4  # Cara 3 y 0 son adyacentes
    modulo_derecha = arka[piso][cara_derecha]
    if modulo_derecha is not None:
        # Verificar prioridades con el módulo de la derecha
        if (modulo_id, modulo_derecha) in prioridades:
            score += 10  # +10 puntos por prioridad satisfecha
        if (modulo_derecha, modulo_id) in prioridades:
            score += 10  # +10 puntos por prioridad bidireccional
    
    # PASO 2: Bonus por piso prioritario
    # Verificar si el módulo tiene preferencias de piso definidas
    if modulo_id in pisos_prioritarios:
        pisos_preferidos = pisos_prioritarios[modulo_id]
        if piso in pisos_preferidos:
            score += 15  # +15 puntos por estar en piso prioritario
    
    # PASO 3: Bonus por completar pisos de abajo hacia arriba
    # Verificar si hay pisos inferiores incompletos
    pisos_inferiores_incompletos = 0
    for piso_inferior in range(piso):
        # Contar espacios vacíos en el piso inferior
        espacios_vacios_piso = sum(1 for cara in range(4) if arka[piso_inferior][cara] is None)
        if espacios_vacios_piso > 0:
            pisos_inferiores_incompletos += 1
    
    # Penalizar si hay pisos inferiores incompletos
    if pisos_inferiores_incompletos > 0:
        score -= pisos_inferiores_incompletos * 5  # -5 puntos por cada piso inferior incompleto
    
    # PASO 4:  Bonus por flexibilidad futura
    # Contamos espacios horizontalmente adyacentes vacíos
    espacios_vacios = 0
    
    # Espacio de la izquierda
    if arka[piso][cara_izquierda] is None:
        espacios_vacios += 1
    
    # Espacio de la derecha
    if arka[piso][cara_derecha] is None:
        espacios_vacios += 1
    
    score += espacios_vacios  # +1 punto por cada espacio horizontalmente adyacente vacío
    
    return score

def encontrar_mejor_posicion(arka_data, modulo_id: str) -> Tuple[int, int, int]:
    """
    Encuentra la mejor posición para un módulo en una arka
    
    Esta función busca en TODAS las posiciones de la arka y encuentra
    la que tenga el mayor score (mejor optimización).
    
    Proceso:
    1. Recorre todas las posiciones (4x4 = 16 posiciones)
    2. Para cada posición válida, calcula su score
    3. Guarda la posición con el mayor score
    
    Args:
        arka_data: Datos de la arka (puede ser matriz o diccionario)
        modulo_id: ID del módulo que queremos colocar
    
    Returns:
        Tuple[int, int, int]: (piso, cara, score) de la mejor posición
        None si no hay posiciones válidas
    """
    # Obtener la matriz de la arka
    if isinstance(arka_data, dict):
        arka = arka_data["matriz"]
    else:
        arka = arka_data
    
    mejor_score = -1  # Inicializamos con un score muy bajo
    mejor_posicion = None
    
    # Recorremos TODAS las posiciones de la arka (4x4)
    for piso in range(arka_data["pisos"]):
        for cara in range(4):
            # Solo evaluamos posiciones válidas (que cumplan restricciones)
            if es_valida(arka_data, piso, cara, modulo_id):
                # Calculamos el score de esta posición
                score = calcular_score(arka_data, piso, cara, modulo_id)
                
                # Si este score es mejor que el anterior, lo guardamos
                if score > mejor_score:
                    mejor_score = score
                    mejor_posicion = (piso, cara, score)
    
    return mejor_posicion  # Retornamos la mejor posición encontrada

def agregar_modulo(arkas: List[Dict], modulo_id: str) -> bool:
    """
    Intenta agregar un módulo a las arkas existentes o crear una nueva
    
    Esta es la función PRINCIPAL de colocación. Sigue esta estrategia:
    1. Primero intenta colocar en arkas existentes (optimiza espacio)
    2. Si no puede, crea una nueva arka
    3. Usa el sistema de scoring para encontrar la mejor posición
    
    Args:
        arkas: Lista de todas las arkas disponibles
        modulo_id: ID del módulo que queremos colocar
    
    Returns:
        bool: True si se colocó exitosamente, False si no se pudo colocar
    """
    # ESTRATEGIA 1: Intentar colocar en alguna arka existente
    # Esto optimiza el uso del espacio (menos arkas = mejor eficiencia)
    for i, arka_data in enumerate(arkas):
        posicion = encontrar_mejor_posicion(arka_data, modulo_id)
        
        if posicion is not None:  # Si encontramos una posición válida
            piso, cara, score = posicion
            arka_data["matriz"][piso][cara] = modulo_id  # Colocamos el módulo
            print(f"Módulo {modulo_id} colocado en Arka {arka_data['numero']}, Piso {piso+1}, Cara {cara+1} (Score: {score})")
            return True  # Éxito: módulo colocado
    
    # ESTRATEGIA 2: Si no se pudo colocar en arkas existentes, crear nueva arka
    # Esto garantiza que siempre podamos colocar el módulo
    nueva_arka_data = nueva_arka()  # Creamos arka vacía
    posicion = encontrar_mejor_posicion(nueva_arka_data, modulo_id)
    
    if posicion is not None:  # Debería ser siempre válido en arka vacía
        piso, cara, score = posicion
        nueva_arka_data["matriz"][piso][cara] = modulo_id  # Colocamos el módulo
        arkas.append(nueva_arka_data)  # Añadimos la nueva arka a la lista
        print(f"Módulo {modulo_id} colocado en NUEVA Arka {nueva_arka_data['numero']}, Piso {piso+1}, Cara {cara+1} (Score: {score})")
        return True  # Éxito: módulo colocado en nueva arka
    
    return False  # Error: no se pudo colocar (no debería pasar nunca)

def ordenar_modulos_por_prioridad(inventario: Dict[str, int]) -> List[Tuple[str, int]]:
    """
    Ordena los módulos por prioridad de colocación
    
    Esta función es CLAVE para el éxito del algoritmo. Ordena los módulos
    en el orden correcto para maximizar las optimizaciones:
    
    ORDEN DE PRIORIDAD:
    1. Módulos restrictivos (difíciles de colocar)
    2. Módulos prioritarios (con preferencias específicas)
    
    Args:
        inventario: Diccionario con módulos y sus cantidades
    
    Returns:
        List[Tuple[str, int]]: Lista ordenada de (módulo_id, cantidad)
    """
    # CATEGORÍA 1: Módulos restrictivos (difíciles de colocar)
    # Estos tienen muchas restricciones, mejor colocarlos temprano
    modulos_restrictivos = ["002", "013", "015", "017", "019", "021", "023", "025", "027"]
    
    # CATEGORÍA 2: Módulos prioritarios (con preferencias específicas)
    # Estos se benefician de estar cerca de otros módulos
    modulos_prioritarios = ["001", "003", "004", "005", "006", "007", "008", "009", "011", "012", "014", "016", "018", "020", "022", "024", "026"]
    
    # Construimos la lista ordenada
    ordenados = []
    
    # PASO 1: Módulos restrictivos primero
    for modulo in modulos_restrictivos:
        if inventario.get(modulo, 0) > 0:
            ordenados.append((modulo, inventario[modulo]))
    
    # PASO 2: Módulos prioritarios (incluye todos los demás)
    for modulo in modulos_prioritarios:
        if inventario.get(modulo, 0) > 0:
            ordenados.append((modulo, inventario[modulo]))
    
    return ordenados

def colocar_inventario_completo(inventario: Dict[str, int]) -> List[Dict]:
    """
    Coloca todo el inventario en las arkas
    
    Esta es la función COORDINADORA que ejecuta todo el algoritmo:
    1. Ordena los módulos por prioridad
    2. Coloca cada módulo usando el sistema de scoring
    3. Maneja errores y proporciona feedback
    
    Args:
        inventario: Diccionario con todos los módulos y sus cantidades
    
    Returns:
        List[List[List]]: Lista de arkas con todos los módulos colocados
    """
    # REINICIAR CONTADOR GLOBAL para cada ejecución
    global contador_arkas
    contador_arkas = 0
    
    arkas = []  # Lista vacía de arkas (empezamos sin ninguna)
    modulos_ordenados = ordenar_modulos_por_prioridad(inventario)  # Ordenamos por prioridad
    
    print("=== INICIANDO COLOCACIÓN DE MÓDULOS ===")
    print(f"Total de módulos a colocar: {sum(inventario.values())}")
    print(f"Arkas iniciales: {len(arkas)}")
    print()
    
    # BUCLE PRINCIPAL: Colocamos cada tipo de módulo
    for modulo_id, cantidad in modulos_ordenados:
        print(f"Colocando {cantidad} módulo(s) de tipo {modulo_id}...")
        
        # Colocamos cada instancia del módulo
        for _ in range(cantidad):
            if not agregar_modulo(arkas, modulo_id):
                print(f"ERROR: No se pudo colocar el módulo {modulo_id}")
                return arkas  # Si hay error, retornamos lo que tengamos
    
    print(f"\n=== COLOCACIÓN COMPLETADA ===")
    print(f"Total de arkas utilizadas: {len(arkas)}")
    arkas = cleaning_postresultado(arkas)
    return arkas

def visualizar_arkas(arkas: List[Dict]):
    """
    Visualiza las arkas de forma clara y legible
    
    Muestra cada arka en formato de matriz 4x4 donde:
    - Cada fila es un piso
    - Cada columna es una cara
    - '---' significa posición vacía
    - Primero muestra números, luego nombres completos
    
    Args:
        arkas: Lista de arkas a visualizar
    """
    # Importar diccionario de información de módulos desde Fase1
    MODULOS_INFO = Fase1.MODULOS_INFO
    
    for arka_data in arkas:
        print(f"\n--- ARKA {arka_data['numero']} ---")
        
        matriz = arka_data["matriz"]
        print(arka_data)
        
        # VISUALIZACIÓN 1: Con números
        print("Números:")
        for piso in range(arka_data["pisos"]):
            modulos_piso = []
            for cara in range(4):
                if matriz[piso][cara] is not None:
                    modulos_piso.append(matriz[piso][cara])
                else:
                    modulos_piso.append('---')
            print(f"Piso {piso+1}: {modulos_piso}")
        
        print()
        
        # VISUALIZACIÓN 2: Con nombres completos
        print("Nombres:")
        for piso in range(arka_data["pisos"]):
            modulos_piso = []
            for cara in range(4):
                if matriz[piso][cara] is not None:
                    modulo_id = matriz[piso][cara]
                    modulo_nombre = MODULOS_INFO.get(modulo_id, f"Desconocido_{modulo_id}")
                    modulos_piso.append(f"{modulo_id}: {modulo_nombre}")
                else:
                    modulos_piso.append('---')
            print(f"Piso {piso+1}: {modulos_piso}")
        print()

def calcular_estadisticas(arkas: List[Dict]):
    """
    Calcula estadísticas de la colocación
    
    Proporciona métricas importantes para evaluar la eficiencia:
    - Número total de arkas utilizadas
    - Porcentaje de eficiencia de uso del espacio
    - Posiciones ocupadas vs totales
    - Estadísticas de reglas de dormitorios
    
    Args:
        arkas: Lista de arkas para analizar
    """
    total_posiciones = sum(arka_data["pisos"] * 4 for arka_data in arkas)
    posiciones_ocupadas = sum(1 for arka_data in arkas for piso in arka_data["matriz"] for cara in piso if cara is not None)
    eficiencia = (posiciones_ocupadas / total_posiciones) * 100 if total_posiciones > 0 else 0
    
    print(f"\n=== ESTADÍSTICAS ===")
    print(f"Total de arkas: {len(arkas)}")
    print(f"Posiciones ocupadas: {posiciones_ocupadas}")
    print(f"Posiciones totales: {total_posiciones}")
    print(f"Eficiencia de uso: {eficiencia:.1f}%")

# =============================================================================
# EJECUCIÓN PRINCIPAL DEL ALGORITMO
# =============================================================================
if __name__ == "__main__":
    print("=== ALGORITMO DE ORDENACIÓN DE ARKAS ===")
    # Obtener inventario de módulos desde Fase1
    inventario = Fase1.calcular_modulos_arka(30, 500, False)
    print(f"Inventario: {inventario[0]}")
    print()
    
    # PASO 1: Colocar todos los módulos usando el algoritmo inteligente
    arkas_resultado = colocar_inventario_completo(inventario[0])
    

    
    
    
    print("===========================================")
    print(arkas_resultado)
    print("===========================================")
    
    # PASO 2: Visualizar el resultado en formato legible
    visualizar_arkas(arkas_resultado)
    
    # PASO 3: Mostrar estadísticas de eficiencia
    calcular_estadisticas(arkas_resultado)