
/**
 * Sistema de navegación espacial con backtracking (versión corregida)
 * Añade control de ciclos, límite de profundidad y depuración
 */

class NaveEspacialBacktracking {
  constructor(mapaData) {
    this.filas = mapaData.matrix.filas;
    this.columnas = mapaData.matrix.columnas;
    this.origen = mapaData.origin;
    this.destino = mapaData.destino;
    this.mapa = mapaData.mapa;
    this.agujerosNegros = JSON.parse(JSON.stringify(mapaData.agujerosNegros));
    this.estrellasGigantes = JSON.parse(JSON.stringify(mapaData.estrellasGigantes));
    this.agujerosGusano = JSON.parse(JSON.stringify(mapaData.agujerosGusano));
    this.celdasEnergia = JSON.parse(JSON.stringify(mapaData.celdasEnergia));

    this.energiaInicial = 500;
    this.limiteProfundidad = 1500;
    this.movimientos = [
      [0, 1], [1, 0], [0, -1], [-1, 0]
    ];
    this.solucion = [];
    this.encontrada = false;
  }

  esAgujeroNegro(fila, col, agujerosNegros) {
    return agujerosNegros.some(agujero => agujero[0] === fila && agujero[1] === col);
  }

  esEstrellaGigante(fila, col, estrellasGigantes) {
    return estrellasGigantes.some(estrella => estrella[0] === fila && estrella[1] === col);
  }

  obtenerAgujeroGusano(fila, col, agujerosGusano) {
    return agujerosGusano.find(g => g.inicio[0] === fila && g.inicio[1] === col) || null;
  }

  obtenerCeldaEnergia(fila, col, celdasEnergia) {
    return celdasEnergia.find(celda => celda.posicion[0] === fila && celda.posicion[1] === col) || null;
  }

  eliminarAgujeroNegroAdyacente(fila, col, agujerosNegros) {
    const direcciones = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    let agujerosActualizados = JSON.parse(JSON.stringify(agujerosNegros));
    let agujeroEliminado = null;
    for (const [dFila, dCol] of direcciones) {
      const nuevaFila = fila + dFila, nuevaCol = col + dCol;
      if (nuevaFila < 0 || nuevaFila >= this.filas || nuevaCol < 0 || nuevaCol >= this.columnas) continue;
      const index = agujerosActualizados.findIndex(a => a[0] === nuevaFila && a[1] === nuevaCol);
      if (index !== -1) {
        agujeroEliminado = [...agujerosActualizados[index]];
        agujerosActualizados.splice(index, 1);
        break;
      }
    }
    return { agujerosActualizados, agujeroEliminado };
  }

  puedeMover(fila, col, energia, visitadas, agujerosNegros) {
    if (fila < 0 || fila >= this.filas || col < 0 || col >= this.columnas) return false;
    const clave = `${fila},${col}`;
    if (visitadas.has(clave)) return false;
    if (this.esAgujeroNegro(fila, col, agujerosNegros)) return false;
    const energiaRequerida = this.mapa[fila][col];
    return energia >= energiaRequerida;
  }

  backtracking(fila, col, energia, visitadas, ruta, agujerosNegros, estrellasGigantes, agujerosGusano, celdasEnergia) {
    if (ruta.length > this.limiteProfundidad) return false;
    if (fila === this.destino[0] && col === this.destino[1]) {
      this.solucion = JSON.parse(JSON.stringify(ruta));
      this.encontrada = true;
      return true;
    }

    const clave = `${fila},${col}`;
    visitadas.add(clave);

    const estadoActual = {
      energia: energia,
      visitadas: new Set(visitadas),
      agujerosNegros: JSON.parse(JSON.stringify(agujerosNegros)),
      estrellasGigantes: JSON.parse(JSON.stringify(estrellasGigantes)),
      agujerosGusano: JSON.parse(JSON.stringify(agujerosGusano)),
      celdasEnergia: JSON.parse(JSON.stringify(celdasEnergia))
    };

    let nuevaEnergia = energia;
    let nuevosAgujeros = [...agujerosNegros];
    let nuevasEstrellas = [...estrellasGigantes];
    let nuevosGusanos = [...agujerosGusano];
    let eventoEspecial = null;

    const celdaEnergia = this.obtenerCeldaEnergia(fila, col, celdasEnergia);
    if (celdaEnergia) {
      nuevaEnergia *= celdaEnergia.recarga;
      eventoEspecial = { tipo: "recarga", posicion: [fila, col], factor: celdaEnergia.recarga };
    }

    if (this.esEstrellaGigante(fila, col, estrellasGigantes)) {
      const res = this.eliminarAgujeroNegroAdyacente(fila, col, nuevosAgujeros);
      nuevosAgujeros = res.agujerosActualizados;
    }

    const gusano = this.obtenerAgujeroGusano(fila, col, agujerosGusano);
    if (gusano) {
      const [newFila, newCol] = gusano.fin;
      if (visitadas.has(`${newFila},${newCol}`)) return false;
      nuevosGusanos = nuevosGusanos.filter(g => g.inicio[0] !== gusano.inicio[0] || g.inicio[1] !== gusano.inicio[1]);
      ruta.push({ posicion: [fila, col], energia: nuevaEnergia, eventoEspecial: { tipo: "gusano", destino: [newFila, newCol] } });
      visitadas.add(`${newFila},${newCol}`);
      nuevaEnergia -= this.mapa[newFila][newCol];
      ruta.push({ posicion: [newFila, newCol], energia: nuevaEnergia });
      return this.backtracking(newFila, newCol, nuevaEnergia, new Set(visitadas), ruta, nuevosAgujeros, nuevasEstrellas, nuevosGusanos, celdasEnergia);
    }

    for (const [dFila, dCol] of this.movimientos) {
      const nuevaFila = fila + dFila, nuevaCol = col + dCol;
      if (this.puedeMover(nuevaFila, nuevaCol, nuevaEnergia, visitadas, nuevosAgujeros)) {
        const energiaGastada = this.mapa[nuevaFila][nuevaCol];
        const energiaRestante = nuevaEnergia - energiaGastada;
        ruta.push({ posicion: [nuevaFila, nuevaCol], energia: energiaRestante });
        if (this.backtracking(nuevaFila, nuevaCol, energiaRestante, new Set(visitadas), ruta, nuevosAgujeros, nuevasEstrellas, nuevosGusanos, celdasEnergia)) {
          return true;
        }
        ruta.pop();
      }
    }

    visitadas.delete(clave);
    return false;
  }

  encontrarRuta() {
    const visitadas = new Set();
    const ruta = [{ posicion: this.origen, energia: this.energiaInicial }];
    this.backtracking(this.origen[0], this.origen[1], this.energiaInicial, visitadas, ruta, this.agujerosNegros, this.estrellasGigantes, this.agujerosGusano, this.celdasEnergia);
    return this.encontrada ? { exito: true, ruta: this.solucion } : { exito: false, mensaje: "No se encontró una ruta válida al destino." };
  }
}

function procesarMapaEspacial(jsonData) {
  try {
    const navegador = new NaveEspacialBacktracking(jsonData);
    return navegador.encontrarRuta();
  } catch (error) {
    return { exito: false, mensaje: `Error al procesar el mapa: ${error.message}` };
  }
}

window.NaveEspacialBacktracking = NaveEspacialBacktracking;
window.procesarMapaEspacial = procesarMapaEspacial;
