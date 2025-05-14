let datos;

document.getElementById('fileInput').addEventListener('change', function (e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = function (event) {
    datos = JSON.parse(event.target.result);
    console.log("✅ Archivo cargado.");
  };
  reader.readAsText(file);
});

document.getElementById('iniciarBtn').addEventListener('click', iniciarBusqueda);

function dentroDelMapa(x, y, mapa) {
  return y >= 0 && y < mapa.length && x >= 0 && x < mapa[0].length;
}

function estaVisitado(x, y, visitados) {
  return visitados.some(pos => pos.x === x && pos.y === y);
}

function esAgujeroNegro(x, y, agujerosNegros) {
  return agujerosNegros.some(pos => pos.x === x && pos.y === y);
}

function esEstrella(x, y, estrellas) {
  return estrellas.some(pos => pos.x === x && pos.y === y);
}

function esGusanoEntrada(x, y, agujerosGusano) {
  return agujerosGusano.find(g => g.origen.x === x && g.origen.y === y);
}

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
      agujerosNegros.splice(index, 1);
      console.log(`🌀 Estrella en (${x}, ${y}) destruye agujero negro en (${nx}, ${ny})`);
      return;
    }
  }
}

function eliminarGusano(gusano, agujerosGusano) {
  const index = agujerosGusano.indexOf(gusano);
  if (index !== -1) agujerosGusano.splice(index, 1);
}

function getFactorRecarga() {
  return Math.random() * (3 - 2) + 2;
}

function crearMovimiento(x, y, direccion, energia, visitados, elementos, evento) {
  return {
    posicion: { x, y },
    direccion,
    energia,
    visitados: [...visitados],
    agujerosNegros: JSON.parse(JSON.stringify(elementos.agujerosNegros)),
    agujerosGusano: JSON.parse(JSON.stringify(elementos.agujerosGusano)),
    estrellas: JSON.parse(JSON.stringify(elementos.estrellas)),
    evento
  };
}

function buscarCamino(x, y, destinoX, destinoY, energia, visitados, historial, elementos, mapa) {
  if (x === destinoX && y === destinoY) {
    console.log("✅ Camino encontrado");
    return { exito: true, historial };
  }

  const direcciones = [
    { dx: 0, dy: -1, nombre: "arriba" },
    { dx: 1, dy: 0, nombre: "derecha" },
    { dx: 0, dy: 1, nombre: "abajo" },
    { dx: -1, dy: 0, nombre: "izquierda" }
  ];

  for (let dir of direcciones) {
    const nx = x + dir.dx;
    const ny = y + dir.dy;

    if (!dentroDelMapa(nx, ny, mapa) || estaVisitado(nx, ny, visitados)) continue;

    const nuevoHistorial = JSON.parse(JSON.stringify(historial));
    const nuevoVisitados = [...visitados, { x: nx, y: ny }];
    let energiaNueva = energia;
    let evento = "normal";

    if (esAgujeroNegro(nx, ny, elementos.agujerosNegros)) {
      console.log(`⛔ Agujero negro bloquea el paso en (${nx}, ${ny})`);
      continue;
    }

    if (esEstrella(nx, ny, elementos.estrellas)) {
      evento = "estrella";
      console.log(`🌟 Estrella activada en (${nx}, ${ny})`);
      eliminarAgujeroNegroAdyacente(nx, ny, elementos.agujerosNegros);
    }

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

    if (mapa[ny][nx] === 0) {
      evento = "recarga";
      const factor = getFactorRecarga();
      energiaNueva *= factor;
      console.log(`🔋 Zona de recarga en (${nx}, ${ny}), energía x${factor.toFixed(2)} -> ${energiaNueva.toFixed(2)}`);
    } else {
      energiaNueva -= mapa[ny][nx];
      console.log(`➡️ Movimiento a (${nx}, ${ny}), gasto: ${mapa[ny][nx]}, energía: ${energiaNueva.toFixed(2)}`);
    }

    if (energiaNueva <= 0) {
      console.log(`⚠️ Sin energía para avanzar a (${nx}, ${ny})`);
      continue;
    }

    nuevoHistorial.push(crearMovimiento(nx, ny, dir.nombre, energiaNueva, nuevoVisitados, elementos, evento));

    const resultado = buscarCamino(nx, nx, destinoX, destinoY, energiaNueva, nuevoVisitados, nuevoHistorial, elementos, mapa);
    if (resultado.exito) return resultado;
  }

  return { exito: false, historial };
}

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

function iniciarBusqueda() {
  if (!datos) {
    alert("Primero carga un archivo .json con el mapa.");
    return;
  }

  console.clear();
  const { mapa, elementos, origen, destino, energiaInicial } = datos;

  console.log("🚀 Iniciando búsqueda desde", origen, "hacia", destino, "con energía:", energiaInicial);
  const resultado = buscarCamino(
    origen.x, origen.y,
    destino.x, destino.y,
    energiaInicial,
    [origen],
    [],
    JSON.parse(JSON.stringify(elementos)),
    mapa
  );

  guardarResultado(resultado.historial, resultado.exito);

  if (resultado.exito) {
    console.log("🎯 Camino encontrado y archivo descargado.");
  } else {
    console.log("❌ No se encontró un camino posible. Se descargó historial parcial.");
  }
}
