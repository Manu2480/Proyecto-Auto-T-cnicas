/**
 * Sistema de navegación espacial con backtracking
 * Encuentra una ruta desde un origen hasta un destino en un mapa espacial
 * con múltiples elementos interactivos y restricciones energéticas
 */

class NaveEspacialBacktracking {
  /**
   * Constructor que inicializa el sistema con los datos del mapa
   * @param {Object} mapaData - Objeto JSON con la información del mapa y elementos
   */
  constructor(mapaData) {
    // Información básica del mapa
    this.filas = mapaData.matrix.filas;
    this.columnas = mapaData.matrix.columnas;
    this.origen = mapaData.origin;
    this.destino = mapaData.destino;
    this.mapa = mapaData.mapa;
    
    // Elementos especiales
    this.agujerosNegros = JSON.parse(JSON.stringify(mapaData.agujerosNegros));
    this.estrellasGigantes = JSON.parse(JSON.stringify(mapaData.estrellasGigantes));
    this.agujerosGusano = JSON.parse(JSON.stringify(mapaData.agujerosGusano));
    this.celdasEnergia = JSON.parse(JSON.stringify(mapaData.celdasEnergia));
    
    // Constantes para el algoritmo
    this.energiaInicial = 50; // Ajustable según necesidad
    this.movimientos = [
      [0, 1],  // Derecha
      [1, 0],  // Abajo
      [0, -1], // Izquierda
      [-1, 0]  // Arriba
    ];
    
    // Resultado
    this.solucion = [];
    this.encontrada = false;
  }

  /**
   * Verifica si una posición contiene un agujero negro
   * @param {number} fila - Fila a verificar
   * @param {number} col - Columna a verificar
   * @returns {boolean} true si es un agujero negro
   */
  esAgujeroNegro(fila, col, agujerosNegros) {
    return agujerosNegros.some(agujero => agujero[0] === fila && agujero[1] === col);
  }

  /**
   * Verifica si una posición contiene una estrella gigante
   * @param {number} fila - Fila a verificar
   * @param {number} col - Columna a verificar
   * @returns {boolean} true si es una estrella gigante
   */
  esEstrellaGigante(fila, col, estrellasGigantes) {
    return estrellasGigantes.some(estrella => estrella[0] === fila && estrella[1] === col);
  }

  /**
   * Determina si existe un agujero de gusano en la posición dada
   * @param {number} fila - Fila a verificar
   * @param {number} col - Columna a verificar
   * @param {Array} agujerosGusano - Lista actual de agujeros de gusano
   * @returns {Object|null} El agujero de gusano o null si no existe
   */
  obtenerAgujeroGusano(fila, col, agujerosGusano) {
    return agujerosGusano.find(gusano => gusano.inicio[0] === fila && gusano.inicio[1] === col) || null;
  }

  /**
   * Busca una celda de energía en la posición especificada
   * @param {number} fila - Fila a verificar
   * @param {number} col - Columna a verificar
   * @param {Array} celdasEnergia - Lista actual de celdas de energía
   * @returns {Object|null} La celda de energía o null si no existe
   */
  obtenerCeldaEnergia(fila, col, celdasEnergia) {
    return celdasEnergia.find(celda => celda.posicion[0] === fila && celda.posicion[1] === col) || null;
  }

  /**
   * Elimina un agujero negro que esté adyacente a una estrella gigante
   * @param {number} fila - Fila de la estrella
   * @param {number} col - Columna de la estrella
   * @param {Array} agujerosNegros - Lista actual de agujeros negros
   * @returns {Object} Resultado con agujeros actualizados y el agujero eliminado
   */
  eliminarAgujeroNegroAdyacente(fila, col, agujerosNegros) {
    const direcciones = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    let agujerosActualizados = JSON.parse(JSON.stringify(agujerosNegros));
    let agujeroEliminado = null;
    
    for (const [dFila, dCol] of direcciones) {
      const nuevaFila = fila + dFila;
      const nuevaCol = col + dCol;
      
      // Verificar límites
      if (nuevaFila < 0 || nuevaFila >= this.filas || nuevaCol < 0 || nuevaCol >= this.columnas) {
        continue;
      }
      
      // Buscar agujero negro adyacente
      const indice = agujerosActualizados.findIndex(
        agujero => agujero[0] === nuevaFila && agujero[1] === nuevaCol
      );
      
      if (indice !== -1) {
        agujeroEliminado = [...agujerosActualizados[indice]];
        agujerosActualizados.splice(indice, 1);
        break;
      }
    }
    
    return { agujerosActualizados, agujeroEliminado };
  }

  /**
   * Verifica si la nave puede moverse a una posición específica
   * @param {number} fila - Fila destino
   * @param {number} col - Columna destino
   * @param {number} energia - Energía actual de la nave
   * @param {Set} visitadas - Conjunto de celdas ya visitadas
   * @param {Array} agujerosNegros - Estado actual de agujeros negros
   * @returns {boolean} true si el movimiento es válido
   */
  puedeMover(fila, col, energia, visitadas, agujerosNegros) {
    // Verificar límites del mapa
    if (fila < 0 || fila >= this.filas || col < 0 || col >= this.columnas) {
      return false;
    }
    
    // Verificar si ya fue visitada
    const clave = `${fila},${col}`;
    if (visitadas.has(clave)) {
      return false;
    }
    
    // Verificar si hay un agujero negro
    if (this.esAgujeroNegro(fila, col, agujerosNegros)) {
      return false;
    }
    
    // Verificar si tiene suficiente energía
    const energiaRequerida = this.mapa[fila][col];
    return energia >= energiaRequerida;
  }

  /**
   * Algoritmo principal de backtracking para encontrar ruta
   * @param {number} fila - Fila actual
   * @param {number} col - Columna actual
   * @param {number} energia - Energía actual de la nave
   * @param {Set} visitadas - Conjunto de celdas visitadas
   * @param {Array} ruta - Ruta actual
   * @param {Array} agujerosNegros - Estado actual de agujeros negros
   * @param {Array} estrellasGigantes - Estado actual de estrellas gigantes
   * @param {Array} agujerosGusano - Estado actual de agujeros de gusano
   * @param {Array} celdasEnergia - Estado actual de celdas de energía
   * @returns {boolean} true si se encontró una solución
   */
  backtracking(fila, col, energia, visitadas, ruta, agujerosNegros, estrellasGigantes, agujerosGusano, celdasEnergia) {
    // Caso base: llegamos al destino
    if (fila === this.destino[0] && col === this.destino[1]) {
      this.solucion = JSON.parse(JSON.stringify(ruta));
      this.encontrada = true;
      return true;
    }
    
    // Marcar celda como visitada
    const clave = `${fila},${col}`;
    visitadas.add(clave);
    
    // Guardar estado actual para posible restauración
    const estadoActual = {
      energia: energia,
      visitadas: new Set(visitadas),
      agujerosNegros: JSON.parse(JSON.stringify(agujerosNegros)),
      estrellasGigantes: JSON.parse(JSON.stringify(estrellasGigantes)),
      agujerosGusano: JSON.parse(JSON.stringify(agujerosGusano)),
      celdasEnergia: JSON.parse(JSON.stringify(celdasEnergia))
    };
    
    // Procesar eventos especiales en la posición actual
    let nuevaEnergia = energia;
    let nuevosAgujeros = [...agujerosNegros];
    let nuevasEstrellas = [...estrellasGigantes];
    let nuevosGusanos = [...agujerosGusano];
    let eventoEspecial = null;
    
    // 1. Verificar celda de energía
    const celdaEnergia = this.obtenerCeldaEnergia(fila, col, celdasEnergia);
    if (celdaEnergia) {
      nuevaEnergia = nuevaEnergia * celdaEnergia.recarga; // Multiplicar por factor de recarga
      eventoEspecial = {
        tipo: "recarga",
        posicion: [fila, col],
        factorRecarga: celdaEnergia.recarga,
        energiaPrevia: energia,
        energiaNueva: nuevaEnergia
      };
    }
    
    // 2. Verificar estrella gigante
    if (this.esEstrellaGigante(fila, col, estrellasGigantes)) {
      const resultado = this.eliminarAgujeroNegroAdyacente(fila, col, nuevosAgujeros);
      nuevosAgujeros = resultado.agujerosActualizados;
      
      if (resultado.agujeroEliminado) {
        eventoEspecial = {
          tipo: "estrella",
          posicion: [fila, col],
          agujeroEliminado: resultado.agujeroEliminado
        };
      }
    }
    
    // 3. Verificar agujero de gusano
    const agujeroGusano = this.obtenerAgujeroGusano(fila, col, agujerosGusano);
    if (agujeroGusano) {
      const destinoGusano = agujeroGusano.fin;
      
      // Eliminar el agujero de gusano después de usarlo
      nuevosGusanos = nuevosGusanos.filter(g => 
        !(g.inicio[0] === agujeroGusano.inicio[0] && g.inicio[1] === agujeroGusano.inicio[1])
      );
      
      eventoEspecial = {
        tipo: "gusano",
        origen: agujeroGusano.inicio,
        destino: agujeroGusano.fin
      };
      
      // Registro del estado actual antes de usar el agujero
      const movimientoActual = {
        posicion: [fila, col],
        energia: nuevaEnergia,
        visitadas: Array.from(visitadas),
        agujerosNegros: nuevosAgujeros,
        estrellasGigantes: nuevasEstrellas,
        agujerosGusano: nuevosGusanos,
        celdasEnergia: celdasEnergia,
        eventoEspecial: eventoEspecial
      };
      
      ruta.push(movimientoActual);
      
      // Actualizar posición al destino del agujero
      fila = destinoGusano[0];
      col = destinoGusano[1];
      
      // Marcar destino del gusano como visitado
      const claveDestino = `${fila},${col}`;
      visitadas.add(claveDestino);
      
      // Registrar el movimiento a través del agujero de gusano
      const movimientoSalida = {
        posicion: [fila, col],
        energia: nuevaEnergia - this.mapa[fila][col], // Consumir energía en el destino
        visitadas: Array.from(visitadas),
        agujerosNegros: nuevosAgujeros,
        estrellasGigantes: nuevasEstrellas,
        agujerosGusano: nuevosGusanos,
        celdasEnergia: celdasEnergia,
        eventoEspecial: {
          tipo: "salidaGusano",
          origen: agujeroGusano.inicio,
          destino: [fila, col]
        }
      };
      
      ruta.push(movimientoSalida);
      nuevaEnergia = movimientoSalida.energia; // Actualizar energía después de salir del gusano
    }
    
    // Probar cada dirección posible
    for (const [dFila, dCol] of this.movimientos) {
      const nuevaFila = fila + dFila;
      const nuevaCol = col + dCol;
      
      // Verificar si podemos movernos a esta posición
      if (this.puedeMover(nuevaFila, nuevaCol, nuevaEnergia, visitadas, nuevosAgujeros)) {
        // Calcular nueva energía después del movimiento
        const energiaGastada = this.mapa[nuevaFila][nuevaCol];
        const energiaRestante = nuevaEnergia - energiaGastada;
        
        // Registrar este movimiento en la ruta
        const movimiento = {
          posicion: [nuevaFila, nuevaCol],
          energia: energiaRestante,
          visitadas: Array.from(visitadas),
          agujerosNegros: nuevosAgujeros,
          estrellasGigantes: nuevasEstrellas,
          agujerosGusano: nuevosGusanos,
          celdasEnergia: celdasEnergia,
          eventoEspecial: null
        };
        
        ruta.push(movimiento);
        
        // Continuar con el algoritmo recursivamente
        if (this.backtracking(
          nuevaFila, nuevaCol, energiaRestante, 
          new Set(visitadas), ruta, 
          nuevosAgujeros, nuevasEstrellas, nuevosGusanos, celdasEnergia
        )) {
          return true;
        }
        
        // Si no funciona, deshacer este movimiento
        ruta.pop();
      }
    }
    
    // Si llegamos aquí, este camino no lleva a una solución
    // Restaurar estado anterior
    visitadas = estadoActual.visitadas;
    return false;
  }

  /**
   * Inicia el algoritmo de búsqueda desde el origen
   * @returns {Object} Resultado con la solución encontrada o mensaje de error
   */
  encontrarRuta() {
    const visitadas = new Set();
    const ruta = [{
      posicion: this.origen,
      energia: this.energiaInicial,
      visitadas: [],
      agujerosNegros: this.agujerosNegros,
      estrellasGigantes: this.estrellasGigantes,
      agujerosGusano: this.agujerosGusano,
      celdasEnergia: this.celdasEnergia,
      eventoEspecial: null
    }];
    
    this.backtracking(
      this.origen[0], 
      this.origen[1], 
      this.energiaInicial,
      visitadas,
      ruta,
      this.agujerosNegros,
      this.estrellasGigantes,
      this.agujerosGusano,
      this.celdasEnergia
    );
    
    if (this.encontrada) {
      return {
        exito: true,
        ruta: this.solucion
      };
    } else {
      return {
        exito: false,
        mensaje: "No se encontró una ruta válida al destino."
      };
    }
  }
}

/**
 * Función principal que procesa el archivo JSON y encuentra una ruta
 * @param {Object} jsonData - Datos del mapa en formato JSON
 * @returns {Object} Resultado con la solución o mensaje de error
 */
function procesarMapaEspacial(jsonData) {
  try {
    // Crear instancia del sistema de navegación
    const navegador = new NaveEspacialBacktracking(jsonData);
    
    // Encontrar ruta
    const resultado = navegador.encontrarRuta();
    
    return resultado;
  } catch (error) {
    return {
      exito: false,
      mensaje: `Error al procesar el mapa: ${error.message}`
    };
  }
}

// Exponer las funciones y clases directamente en el objeto global (window) para navegadores
window.NaveEspacialBacktracking = NaveEspacialBacktracking;
window.procesarMapaEspacial = procesarMapaEspacial;