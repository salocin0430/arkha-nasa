import Fase2, Fase1
import json
from datetime import datetime
import numpy as np
import math

constantes = {
    "altura_modulo": 3.1,
    "ancho_modelo": 3.6,
    "x": "horizontal",
    "y": "vertical",
    "z": "profundidad",
    "0_grados": [0, 0, 0],
    "90_grados_derecha": [0, 1.5708, 0],
    "180_grados": [0, 3.14159, 0],
    "270_grados_derecha": [0, 4.71239, 0],
    "360_grados": [0, 6.28318, 0]
}

def id_a_modulo(modulo_id):
    """
    Convierte el ID numérico del módulo al nombre del archivo
    
    Args:
        modulo_id: ID del módulo (ej: "013", "015")
        
    Returns:
        str: Nombre del archivo del módulo
    """
    # Mapeo de IDs a nombres de archivo
    mapeo_modulos = {
    "001": "base_l1_v1",
    "002": "lab_tri_l2_v1",
    "003": "lab_l2_v1",
    "004": "powercore_l1_v1",
    "005": "recreacion_tri_l1_v1",
    "006": "recreacion_l1_v1",
    "007": "huertatri_l1_v1",
    "008": "huerta_l1_v1",
    "009": "circulacion_l1_v1",
    "010": "access_core_l1_v1",
    "011": "transcore_l2_v1",
    "012": "sanitarybay_l2_v1",
    "013": "sanitarybaytri_l2_v1",
    "014": "l2_exercisebay_v1",
    "015": "l2_exercisebaytri_v1",
    "016": "l2_systemsbay_v1",
    "017": "l2_systemsbaytri_v1",
    "018": "l2_storagebay_v1",
    "019": "l2_storagebaytri_v1",
    "020": "l3_galleycomputerbay_v1",
    "021": "l3_galleycomputerbaytri_v1",
    "022": "l3_mealprepbay_v1",
    "023": "l3_mealprepbaytri_v1",
    "024": "l3_medbay_v1",
    "025": "l3_medbaytri_v1",
    "026": "l2_sleepwardbay_v1",
    "027": "l2_sleepwardbaytri_v1",
    }
    
    return mapeo_modulos.get(modulo_id, f"unknown_module_{modulo_id}")

def añadir_modulos_por_arka(arkas_resultado, P, T, TipoC):
    """
    Añade módulos específicos por cada arka en estructura vertical:
    - 1 módulo 001 (base)
    - 4 módulos 011 (torre vertical de 4 niveles)
    - 1 módulo 004 (techo)
    
    Args:
        arkas_resultado: Lista de arkas resultado
        
    Returns:
        tuple: (lista_de_módulos, posición_base_anterior, posición_base_actual)
    """
    modulos_adicionales = []
    posicion_base_anterior = None
    posicion_base_actual = None
    number_of_access_core = 0
    if T <= 600:
        number_of_access_core = math.ceil(P / 6)
    else: 
        number_of_access_core = math.ceil(P / 6) * 2
    
    for i, arka in enumerate(arkas_resultado):
        numero_arka = arka["numero"]
        es_ultima_arka = (i == len(arkas_resultado) - 1)
        
        if numero_arka == 1:
            posicion_base_actual = np.array([0, 0, 0])
        else:
            if arka["direccion_anterior"] == "ARRIBA":
                posicion_base_actual = np.array([0, 0, 4*constantes["ancho_modelo"]]) + posicion_base_anterior
            elif arka["direccion_anterior"] == "IZQ":
                posicion_base_actual = np.array([4*constantes["ancho_modelo"], 0, 0]) + posicion_base_anterior
            elif arka["direccion_anterior"] == "ABAJO":
                posicion_base_actual = np.array([0, 0, -4*constantes["ancho_modelo"]]) + posicion_base_anterior
            elif arka["direccion_anterior"] == "DER":
                posicion_base_actual = np.array([-4*constantes["ancho_modelo"], 0, 0]) + posicion_base_anterior
            
      
        # Guardar posición base anterior
        posicion_base_anterior = posicion_base_actual
        
        # 1 módulo 001 (base) - en el centro de la arka
        modulo_001 = {
            "id": id_a_modulo("001"),
            "position": posicion_base_actual.tolist(),
            "rotation": [0, 0, 0],
            "scale": [1, 1, 1]
        }
        modulos_adicionales.append(modulo_001)
        
        # 1 módulo 010 (access core) - en el centro de la arka
        print(number_of_access_core-1)
        print(i)
        if number_of_access_core-1 >= i:
            modulo_010 = {
                "id": id_a_modulo("010"),
                "position": posicion_base_actual.tolist(),
                "rotation": [0, 0, 0],
                "scale": [1, 1, 1]
            }
            modulos_adicionales.append(modulo_010)
        
        # 4 módulos 011 (torre vertical) - uno encima del otro
        for nivel in range(arka["pisos"]):
            posicion_torre = posicion_base_actual + np.array([0, (nivel + 1) * constantes["altura_modulo"], 0])
            modulo_011 = {
                "id": id_a_modulo("011"),
                "position": posicion_torre.tolist(),
                "rotation": [0, 0, 0],
                "scale": [1, 1, 1]
            }
            modulos_adicionales.append(modulo_011)
        
        # 1 módulo 004 (techo) - en la parte superior de la torre
        posicion_techo = posicion_base_actual + np.array([0, (arka["pisos"] + 1) * constantes["altura_modulo"], 0])
        modulo_004 = {
            "id": id_a_modulo("004"),
            "position": posicion_techo.tolist(),  # 5 niveles de altura (base + 4 torre + techo)
            "rotation": [0, 0, 0],
            "scale": [1, 1, 1]
        }
        modulos_adicionales.append(modulo_004)
        
        #Arkas por piso
        for piso in range(arka["pisos"]):
            
            print(f"Arka {numero_arka} - Piso {piso+1} - Es última: {es_ultima_arka}")          
            
            centro_piso = posicion_base_actual + np.array([0, (piso+1) * constantes["altura_modulo"], 0])
            piso_cara_A = {
                "id": id_a_modulo(arka["matriz"][piso][0]),
                "position": [centro_piso[0], centro_piso[1], centro_piso[2] - constantes["ancho_modelo"]],
                "rotation": constantes["0_grados"],
                "scale": [1, 1, 1]
            }
            
            if arka["matriz"][piso][0] is not None:
                modulos_adicionales.append(piso_cara_A)
            
            piso_cara_B = {
                "id": id_a_modulo(arka["matriz"][piso][1]),
                "position": [centro_piso[0] - constantes["ancho_modelo"], centro_piso[1], centro_piso[2]],
                "rotation": constantes["90_grados_derecha"],
                "scale": [1, 1, 1]
            }
            
            if arka["matriz"][piso][1] is not None:
                modulos_adicionales.append(piso_cara_B)
            
            piso_cara_C = {
                "id": id_a_modulo(arka["matriz"][piso][2]),
                "position": [centro_piso[0], centro_piso[1], centro_piso[2] + constantes["ancho_modelo"]],
                "rotation": constantes["180_grados"],
                "scale": [1, 1, 1]
            }
            
            if arka["matriz"][piso][2] is not None:
                modulos_adicionales.append(piso_cara_C)
                
            piso_cara_D = {
                "id": id_a_modulo(arka["matriz"][piso][3]),
                "position": [centro_piso[0] + constantes["ancho_modelo"], centro_piso[1], centro_piso[2]],
                "rotation": constantes["270_grados_derecha"],
                "scale": [1, 1, 1]
            }
            if arka["matriz"][piso][3] is not None:
                modulos_adicionales.append(piso_cara_D)         
            
        if not es_ultima_arka:
            print(arka["direccion_actual"])
            centro_piso2 = posicion_base_actual + np.array([0, (2) * constantes["altura_modulo"], 0])
            if arka["direccion_actual"] == "ARRIBA":
                posicion_099 =  [centro_piso2[0], centro_piso2[1], centro_piso2[2] + 2*constantes["ancho_modelo"]]
                rotation_099 = constantes["0_grados"]
            elif arka["direccion_actual"] == "IZQ":
                posicion_099 = [centro_piso2[0] + 2*constantes["ancho_modelo"], centro_piso2[1], centro_piso2[2]]
                rotation_099 = constantes["270_grados_derecha"]
            elif arka["direccion_actual"] == "ABAJO":
                posicion_099 = [centro_piso2[0], centro_piso2[1], centro_piso2[2] - 2*constantes["ancho_modelo"]]
                rotation_099 = constantes["180_grados"]
            elif arka["direccion_actual"] == "DER":
                posicion_099 = [centro_piso2[0] - 2*constantes["ancho_modelo"], centro_piso2[1], centro_piso2[2]]
                rotation_099 = constantes["90_grados_derecha"]
            
            direccion_actual_099 = {
                "id": id_a_modulo("009"),
                "position": posicion_099,
                "rotation": rotation_099,
                "scale": [1, 1, 1]
            }
            modulos_adicionales.append(direccion_actual_099)
    
    return modulos_adicionales, posicion_base_anterior.tolist() if posicion_base_anterior is not None else None, posicion_base_actual.tolist()

def generar_json_solo_001_011_004(arkas_resultado, passengers=30, duration=500, terrain="moon", isScientific=True):
    """
    Genera el JSON SOLO con módulos 001, 011 y 004 (estructura vertical)
    
    Args:
        arkas_resultado: Lista de arkas resultado
        passengers: Número de pasajeros
        duration: Duración de la misión
        terrain: Tipo de terreno ("moon", "mars", "asteroid")
        isScientific: Si es una misión científica
        
    Returns:
        dict: JSON solo con módulos 001, 011 y 004
    """
    # Obtener módulos adicionales (estructura vertical)
    modulos_adicionales, pos_base_anterior, pos_base_actual = añadir_modulos_por_arka(arkas_resultado, passengers, duration, isScientific)
    
    # Crear JSON final SOLO con módulos 001, 011 y 004
    json_result = {
        "parameters": {
            "passengers": passengers,
            "duration": duration,
            "terrain": terrain,
            "isScientific": isScientific
        },
        "totalModules": len(modulos_adicionales),
        "modules": modulos_adicionales,
        "metadata": {
            "generatedAt": datetime.now().isoformat() + "Z",
            "algorithmVersion": "v3.0.0",
            "estimatedCost": len(modulos_adicionales) * 3500,
            "currency": "ARKHA",
            "totalArkas": len(arkas_resultado),
            "posicionBaseAnterior": pos_base_anterior,
            "posicionBaseActual": pos_base_actual
        }
    }
    
    return json_result

# Ejecutar el proceso
if __name__ == "__main__":
    P = 30
    T = 500
    TipoC = False
    inventario = Fase1.calcular_modulos_arka(P, T, False)
    arkas_resultado = Fase2.colocar_inventario_completo(inventario[0])
    print(arkas_resultado)
    json_result = generar_json_solo_001_011_004(arkas_resultado, P, T, "moon", TipoC)
    
    # Guardar en archivo
    with open('arkas_resultado.json', 'w', encoding='utf-8') as f:
        json.dump(json_result, f, indent=2, ensure_ascii=False)
    
    print("JSON generado SOLO con módulos 001, 011 y 004")
    print(f"Total de módulos: {json_result['totalModules']}")
    print(f"Total de arkas: {json_result['metadata']['totalArkas']}")
    print(f"Costo estimado: {json_result['metadata']['estimatedCost']} {json_result['metadata']['currency']}")











