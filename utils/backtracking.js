// // Guardamos aquí los datos del archivo JSON que sube el usuario
// let datos;

// // Esperamos a que el usuario cargue un archivo .json
// document.getElementById('fileInput').addEventListener('change', function (e) {
//   const file = e.target.files[0];
//   const reader = new FileReader();
//   reader.onload = function (event) {
//     datos = JSON.parse(event.target.result); // Convertimos el contenido del archivo a un objeto de JavaScript
//     console.log("✅ Archivo cargado.");
//   };
//   reader.readAsText(file); // Leemos el contenido del archivo como texto
// });

// // Cuando se hace clic en el botón, se llama a esta función
// document.getElementById('iniciarBtn').addEventListener('click', iniciarBusqueda);

// Verifica si una posición está dentro de los límites del mapa
function dentroDelMapa(x, y, mapa) {
  return y >= 0 && y < mapa.length && x >= 0 && x < mapa[0].length;
}

// Verifica si una posición ya fue visitada
function estaVisitado(x, y, visitados) {
  return visitados.some(pos => pos.x === x && pos.y === y);
}

// Verifica si hay un agujero negro en la posición
function esAgujeroNegro(x, y, agujerosNegros) {
  return agujerosNegros.some(pos => pos.x === x && pos.y === y);
}

// Verifica si hay una estrella en la posición
function esEstrella(x, y, estrellas) {
  return estrellas.some(pos => pos.x === x && pos.y === y);
}

// Verifica si en esa posición hay una entrada a un agujero de gusano
function esGusanoEntrada(x, y, agujerosGusano) {
  return agujerosGusano.find(g => g.origen.x === x && g.origen.y === y);
}

// Una estrella destruye un agujero negro adyacente (arriba, abajo, izq, der)
function eliminarAgujeroNegroAdyacente(x, y, agujerosNegros) {
  const adyacentes = [
    { dx: 0, dy: -1 }, { dx: 1, dy: 0 },
    { dx: 0, dy: 1 }, { dx: -1, dy: 0 }
  ];
  for (let { dx, dy } of adyacentes) {
    const nx = x + dx;
    const ny = y + dy;
    const index = agujerosNegros.findIndex(pos => pos.x === nx && pos.y === ny);
    if (index !== -1) {
      agujerosNegros.splice(index, 1); // eliminamos el agujero negro
      console.log(`🌀 Estrella en (${x}, ${y}) destruye agujero negro en (${nx}, ${ny})`);
      return;
    }
  }
}

// Elimina un agujero de gusano ya usado (para que no se repita)
function eliminarGusano(gusano, agujerosGusano) {
  const index = agujerosGusano.indexOf(gusano);
  if (index !== -1) agujerosGusano.splice(index, 1);
}

// Calcula un factor aleatorio entre 2 y 3 para recarga de energía
function getFactorRecarga() {
  return Math.random() * (3 - 2) + 2;
}

// Crea un objeto que representa un movimiento realizado por el robot
function crearMovimiento(x, y, direccion, energia, visitados, elementos, evento) {
  return {
    posicion: { x, y },
    direccion,
    energia,
    visitados: [...visitados], // Copiamos los lugares visitados hasta ese momento
    agujerosNegros: JSON.parse(JSON.stringify(elementos.agujerosNegros)),
    agujerosGusano: JSON.parse(JSON.stringify(elementos.agujerosGusano)),
    estrellas: JSON.parse(JSON.stringify(elementos.estrellas)),
    evento // Tipo de evento: normal, estrella, gusano, etc.
  };
}

// Función principal de backtracking: trata de encontrar un camino al destino
function buscarCamino(x, y, destinoX, destinoY, energia, visitados, historial, elementos, mapa) {
  // Si estamos en el destino, terminamos
  if (x === destinoX && y === destinoY) {
    console.log("✅ Camino encontrado");
    return { exito: true, historial };
  }

  // Posibles direcciones para moverse (arriba, derecha, abajo, izquierda)
  const direcciones = [
    { dx: 0, dy: -1, nombre: "arriba" },
    { dx: 1, dy: 0, nombre: "derecha" },
    { dx: 0, dy: 1, nombre: "abajo" },
    { dx: -1, dy: 0, nombre: "izquierda" }
  ];

  for (let dir of direcciones) {
    const nx = x + dir.dx;
    const ny = y + dir.dy;

    // Validaciones básicas para no salir del mapa ni repetir casillas
    if (!dentroDelMapa(nx, ny, mapa) || estaVisitado(nx, ny, visitados)) continue;

    // Clonamos los historiales y visitados para no modificarlos directamente
    const nuevoHistorial = JSON.parse(JSON.stringify(historial));
    const nuevoVisitados = [...visitados, { x: nx, y: ny }];
    let energiaNueva = energia;
    let evento = "normal";

    // Si hay agujero negro, no podemos pasar
    if (esAgujeroNegro(nx, ny, elementos.agujerosNegros)) {
      console.log(`⛔ Agujero negro bloquea el paso en (${nx}, ${ny})`);
      continue;
    }

    // Si hay estrella, se activa y destruye un agujero negro cercano
    if (esEstrella(nx, ny, elementos.estrellas)) {
      evento = "estrella";
      console.log(`🌟 Estrella activada en (${nx}, ${ny})`);
      eliminarAgujeroNegroAdyacente(nx, ny, elementos.agujerosNegros);
    }

    // Si hay entrada a un agujero de gusano
    const gusano = esGusanoEntrada(nx, ny, elementos.agujerosGusano);
    if (gusano) {
      evento = "gusano_entrada";
      console.log(`🕳️ Entrada a gusano en (${nx}, ${ny}) -> (${gusano.destino.x}, ${gusano.destino.y})`);
      eliminarGusano(gusano, elementos.agujerosGusano);
      nuevoVisitados.push(gusano.destino);
      nuevoHistorial.push(crearMovimiento(nx, ny, dir.nombre, energiaNueva, nuevoVisitados, elementos, evento));
      nuevoHistorial.push(crearMovimiento(gusano.destino.x, gusano.destino.y, "salto", energiaNueva, nuevoVisitados, elementos, "gusano_salida"));
      const resultado = buscarCamino(gusano.destino.x, gusano.destino.y, destinoX, destinoY, energiaNueva, nuevoVisitados, nuevoHistorial, elementos, mapa);
      if (resultado.exito) return resultado;
      continue;
    }

    // Zona de recarga (valor 0 en el mapa)
    if (mapa[ny][nx] === 0) {
      evento = "recarga";
      const factor = getFactorRecarga();
      energiaNueva *= factor;
      console.log(`🔋 Zona de recarga en (${nx}, ${ny}), energía x${factor.toFixed(2)} -> ${energiaNueva.toFixed(2)}`);
    } else {
      // Si no es recarga, se gasta energía según el valor de la celda
      energiaNueva -= mapa[ny][nx];
      console.log(`➡️ Movimiento a (${nx}, ${ny}), gasto: ${mapa[ny][nx]}, energía: ${energiaNueva.toFixed(2)}`);
    }

    // Si la energía se acaba, no podemos seguir
    if (energiaNueva <= 0) {
      console.log(`⚠️ Sin energía para avanzar a (${nx}, ${ny})`);
      continue;
    }

    // Registramos este movimiento
    nuevoHistorial.push(crearMovimiento(nx, ny, dir.nombre, energiaNueva, nuevoVisitados, elementos, evento));

    // Llamamos recursivamente para seguir buscando el camino
    const resultado = buscarCamino(nx, ny, destinoX, destinoY, energiaNueva, nuevoVisitados, nuevoHistorial, elementos, mapa);
    if (resultado.exito) return resultado;
  }

  // Si no encontramos solución desde esta ruta
  return { exito: false, historial };
}

// Función para guardar los resultados como un archivo descargable
function guardarResultado(historial, exito) {
  const resultado = { exito, historial };
  const blob = new Blob([JSON.stringify(resultado, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = exito ? 'camino_resultado.json' : 'sin_solucion_resultado.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Inicia todo el proceso de búsqueda cuando el usuario hace clic en el botón
export function iniciarBusqueda(datos) {
  if (!datos) {
    alert("Primero carga un archivo .json con el mapa.");
    return;
  }

  console.clear();
  const { mapa, elementos, origen, destino, energiaInicial } = datos;

  console.log("🚀 Iniciando búsqueda desde", origen, "hacia", destino, "con energía:", energiaInicial);

  // Ejecutamos el backtracking
  const resultado = buscarCamino(
    origen.x, origen.y,
    destino.x, destino.y,
    energiaInicial,
    [origen],
    [],
    JSON.parse(JSON.stringify(elementos)),
    mapa
  );

  // Guardamos el resultado, haya o no solución
  guardarResultado(resultado.historial, resultado.exito);

  if (resultado.exito) {
    console.log("🎯 Camino encontrado y archivo descargado.");
  } else {
    console.log("❌ No se encontró un camino posible. Se descargó historial parcial.");
  }
  return resultado;
}