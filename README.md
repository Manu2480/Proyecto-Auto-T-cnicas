# Manual Técnico del Sistema - AutoTécnicas

## Descripción General

Este proyecto implementa algoritmos de autómatas finitos y backtracking para resolver problemas específicos:

1. **Validación de direcciones IP** mediante autómatas finitos
2. **Validación de códigos** con formato específico mediante autómatas finitos  
3. **Búsqueda de caminos** en mapas interestelares usando backtracking

## Estructura del Proyecto

```
Proyecto-Auto-Técnicas/
├── utils/
│   ├── automataip.js      # Validador de direcciones IP
│   ├── automatacod.js     # Validador de códigos  
│   └── backtracking.js    # Algoritmo de búsqueda de caminos
├── js/
│   ├── index.js          # Controlador principal
│   └── interestelar.js   # Interfaz del simulador interestelar
├── html/
│   ├── interestelar.html # Vista del simulador
│   └── automataip.html   # Vista del validador IP
└── css/                  # Estilos de la aplicación
```

## Módulos Técnicos

### 1. Validador de Direcciones IP (automataip.js)

#### Especificación del Autómata

- **Σ (Alfabeto)**: `{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, .}`
- **Q (Estados)**: `{Q0, Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10, Q11, Q12, Q13, Q14}`
- **q₀ (Estado Inicial)**: `Q0`
- **F (Estados de Aceptación)**:
  - Partes intermedias: `{Q14}`
  - Parte final: `{Q2-Q13}`
- **δ (Función de Transición)**: Matrices definidas para validar octetos 0-255

#### Funciones Principales

```javascript
validarIp(ip)           // Función principal de validación
validarIpAux(parte)     // Valida partes intermedias (requiere punto final)
validarIpFinal(parte)   // Valida la última parte (sin punto)
```

#### Reglas de Validación

- Rango válido: 0-255 por octeto
- No permite ceros a la izquierda (excepto "0")
- Exactamente 4 octetos separados por puntos
- Estado Q1 representa error/rechazo

### 2. Validador de Códigos (automatacod.js)

#### Especificación del Autómata

- **Σ (Alfabeto)**: `{# (dígitos 0-9), A (letras a-z, A-Z), - (guión)}`
- **Q (Estados)**: `{Q0, Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10, Q11, Q12, Q13}`
- **q₀ (Estado Inicial)**: `Q0`
- **F (Estados de Aceptación)**: `{Q13}`
- **δ (Función de Transición)**: Matriz para formato `####-##-####`

#### Formato Esperado

```
AAAA-LL-NNNN
│    │  └── 4 dígitos (número)
│    └─── 2 letras  
└──────── 4 dígitos (año ≥ 1900)
```

#### Validaciones Especiales

- Año debe ser ≥ 1900 (no puede empezar con 0)
- Si empieza con 1, el segundo dígito debe ser 9
- Q1 es estado de error/rechazo

### 3. Algoritmo de Backtracking (backtracking.js)

#### Funcionalidades

```javascript
iniciarBusqueda(datos)  // Función principal exportada
buscarCamino(...)       // Algoritmo recursivo de backtracking
```

#### Elementos del Mapa

| Elemento | Efecto |
|----------|--------|
| **Agujeros Negros** ⚫ | Bloquean el paso completamente |
| **Estrellas Gigantes** 🌟 | Destruyen agujero negro adyacente |
| **Agujeros de Gusano** 🕳️ | Teletransporte instantáneo |
| **Zonas de Recarga** ⚡ | Multiplican energía (factor 2-3) |
| **Celdas Normales** | Consumen energía según valor |

#### Algoritmo de Búsqueda

1. **Validaciones**: Límites del mapa, posiciones visitadas
2. **Obstáculos**: Verificación de agujeros negros
3. **Efectos especiales**: 
   - Activación de estrellas (destruye agujeros negros)
   - Uso de agujeros de gusano (una sola vez)
   - Recarga de energía
4. **Recursión**: Exploración de 4 direcciones (↑↓←→)
5. **Backtracking**: Retroceso si no hay solución

#### Estructura de Datos de Entrada

```json
{
  "mapa": [[...]], 
  "elementos": {
    "agujerosNegros": [{"x": 0, "y": 0}],
    "estrellas": [...],
    "agujerosGusano": [{"origen": {...}, "destino": {...}}],
    "zonasRecarga": [{"posicion": {...}, "recarga": 2.5}]
  },
  "origen": {"x": 0, "y": 0},
  "destino": {"x": 10, "y": 10},
  "energiaInicial": 1000
}
```

## API de las Funciones

### Validador IP

```javascript
import { validarIp } from './utils/automataip.js';

const resultado = validarIp("192.168.1.1");
// Retorna: { estado: boolean, message: string }
```

### Validador Códigos

```javascript
import { validarCodigo } from './utils/automatacod.js';

const resultado = validarCodigo("1923-cd-0484");
// Retorna: { estado: boolean, message: string }
```

### Backtracking

```javascript
import { iniciarBusqueda } from './utils/backtracking.js';

const resultado = iniciarBusqueda(datosDelMapa);
// Retorna: { exito: boolean, historial: [...] }
```

## Consideraciones de Implementación

### Optimizaciones

- **Clonación profunda** de estados para evitar efectos laterales
- **Validación temprana** para reducir exploraciones innecesarias
- **Reutilización de matrices** de transición

### Limitaciones

- El backtracking puede ser computacionalmente costoso en mapas grandes
- Los autómatas están optimizados para casos específicos de validación
- No hay optimización para múltiples caminos simultáneos

### Casos de Error

- **IP**: Caracteres inválidos, formato incorrecto, rangos fuera de 0-255
- **Códigos**: Formato incorrecto, años inválidos, caracteres no permitidos  
- **Backtracking**: Sin energía suficiente, no hay camino posible, datos malformados

## Uso Integrado

El sistema se integra a través de `interestelar.js` que:

1. Genera mapas aleatorios con obstáculos
2. Visualiza el proceso de búsqueda en tiempo real
3. Guarda y carga configuraciones en formato JSON
4. Proporciona interfaz gráfica para configuración de parámetros