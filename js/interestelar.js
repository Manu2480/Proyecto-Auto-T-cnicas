import { iniciarBusqueda } from "../utils/backtracking.js";

const validaciones = (data) => {
  // Validaciones de los datos del formulario
  const {
    dimensionesX,
    dimensionesY,
    inicioX,
    inicioY,
    finalX,
    finalY,
    agujerosNegros,
    estrellasGigantes,
    agujerosGusano,
    celdasEnergia,
  } = data;
  if (dimensionesX < 30 || dimensionesY < 30) {
    alert("Las dimensiones del mapa deben ser mayores a 30");
    return false;
  }
  if (
    inicioX < 0 ||
    inicioY < 0 ||
    finalX < 0 ||
    finalY < 0 ||
    inicioX > dimensionesX ||
    inicioY > dimensionesY ||
    finalX > dimensionesX ||
    finalY > dimensionesY
  ) {
    alert("Las coordenadas de inicio y fin deben estar dentro del mapa");
    return false;
  }
  if (inicioX == finalX && inicioY == finalY) {
    alert("Las coordenadas de inicio y fin no pueden ser iguales");
    return false;
  }
  if (
    agujerosNegros < 0 ||
    agujerosNegros > (dimensionesX * dimensionesY) / 2
  ) {
    alert(
      "El número de agujeros en el mapa no puede ser menor a 0 o mayor a la mitad del mapa"
    );
    return false;
  }
  if (estrellasGigantes < 0 || estrellasGigantes > agujerosNegros) {
    alert(
      "El número de estrellas gigantes en el mapa no puede ser menor a 0 o mayor que la cantidad de agujeros negros"
    );
    return false;
  }
  if (
    agujerosGusano < 0 ||
    agujerosGusano > (dimensionesX * dimensionesY) / 3
  ) {
    alert(
      "El número de agujeros de gusano en el mapa no puede ser menor a 0 o mayor a un tercio del mapa"
    );
    return false;
  }

  if (celdasEnergia < 0 || celdasEnergia > (dimensionesX * dimensionesY) / 10) {
    alert(
      "El número de celdas de energía en el mapa no puede ser menor a 0 o mayor a un décimo del mapa"
    );
    return false;
  }
  return true;
};

const generarObstaculos = (data) => {
  const posicionesUnicas = new Set();

  const generarPosicionUnica = (data) => {
    let x, y, key;
    do {
      x = Math.floor(Math.random() * data.dimensionesX);
      y = Math.floor(Math.random() * data.dimensionesY);
      key = `${x},${y}`;
    } while (
      posicionesUnicas.has(key) ||
      (x === data.inicioX && y === data.inicioY) ||
      (x === data.finalX && y === data.finalY)
    );
    posicionesUnicas.add(key);
    return [x, y];
  };

  const agujerosNegros = [];
  const estrellasGigantes = [];
  const agujerosGusano = [];
  const celdasEnergia = [];

  for (let i = 0; i < data.agujerosNegros; i++) {
    let posicion = generarPosicionUnica(data);
    agujerosNegros.push({x:posicion[1], y:posicion[0]});
  }

  for (let i = 0; i < data.estrellasGigantes; i++) {
    let posicion = generarPosicionUnica(data);
    estrellasGigantes.push({ x:posicion[1], y:posicion[0] });
  }

  for (let i = 0; i < data.agujerosGusano; i++) {
    const inicio = generarPosicionUnica(data);
    const fin = generarPosicionUnica(data);
    agujerosGusano.push({ origen:{x:inicio[1], y:inicio[0]}, destino:{x:fin[1], y:fin[0]} });
  }

  for (let i = 0; i < data.celdasEnergia; i++) {
    let posicion = generarPosicionUnica(data);
    let obj = {
      posicion: { x: posicion[1], y: posicion[0] },
      recarga: Math.floor(Math.random() * 4) + 2,
    };
    celdasEnergia.push(obj);
  }

  return { agujerosNegros, estrellasGigantes, agujerosGusano, celdasEnergia };
};

const generarMapa = (data) => {
  let mapa = [[]];
  for (let i = 0; i < data.dimensionesY; i++) {
    mapa[i] = [];
    for (let j = 0; j < data.dimensionesX; j++) {
      mapa[i][j] = Math.floor(Math.random() * 10) + 1;
    }
  }
  mapa[data.inicioX][data.inicioY] = 0;
  mapa[data.finalX][data.finalY] = 0;

  const { agujerosNegros, estrellasGigantes, agujerosGusano, celdasEnergia } =
    generarObstaculos(data);
  
  celdasEnergia.forEach((celda) => {
    mapa[celda.posicion.y][celda.posicion.x] = 0;
  });

  const backtraking = {
    mapa: mapa,
    elementos: {
      agujerosNegros: agujerosNegros,
      agujerosGusano: agujerosGusano,
      estrellas: estrellasGigantes,
      zonasRecarga: celdasEnergia,
    },
    origen: { x: data.inicioX, y: data.inicioY },
    destino: { x: data.finalX, y: data.finalY },
    energiaInicial: data.energiaInicial,
  };
  return backtraking;
};

const mostrarMapa = (data) => {
  const contenedor = document.getElementById("interstellarForm");
  if (!contenedor) {
    console.error('No se encontró el contenedor con id "mapaContainer".');
    return;
  }
  contenedor.innerHTML = '<table id="mapa" class="mapa"></table>'; // Limpia el contenedor
  const tabla = document.querySelector("#mapa");
  console.log(data);
  
  for (let i = 0; i < data.mapa.length; i++) {
    const fila = document.createElement("tr");
    for (let j = 0; j < data.mapa[0].length; j++) {
      const celda = document.createElement("td");
      let caracter = data.mapa[i][j];
      celda.classList.add(`galaxy-bg-${data.mapa[i][j]}`);
      if (i === data.origen.y && j === data.origen.x) {
        caracter = "🚀";
      }
      if (i === data.destino.y && j === data.destino.x) {
        caracter = "🏁";
      }
      
      let elementos = data.elementos;      
      elementos.agujerosNegros.forEach((element) => {
        if (i === element.y && j === element.x) {
          caracter = "⚫";
        }
      });
      elementos.estrellas.forEach((element) => {
        if (i === element.y && j === element.x) {
          caracter = "🌟";
        }
      });
      elementos.agujerosGusano.forEach((element) => {        
        if (
          (i === element.origen.y && j === element.origen.x) ||
          (i === element.destino.y && j === element.destino.x)
        ) {
          caracter = "🕳️";
        }
      });
      elementos.zonasRecarga.forEach((element) => {
        if (i === element.posicion.y && j === element.posicion.x) {
          caracter = "⚡";
        }
      });
      celda.textContent = caracter;

      fila.appendChild(celda);
    }

    tabla.appendChild(fila);
  }
};

const actualizarMapa = (move) => {
  const tabla = document.querySelector("#mapa");
  const celda = tabla.rows[move.posicion.y].cells[move.posicion.x];
  celda.classList.add("visited");
  celda.textContent = "🚀";

  // Actualiza las celdas visitadas
  move.visitados.forEach((pos) => {
    const celdaVisitada = tabla.rows[pos.y].cells[pos.x];
    celdaVisitada.classList.add("visited");
    celdaVisitada.textContent = "✅";
  });

  // Actualiza los agujeros negros
  if (move.agujerosNegros) {
    move.agujerosNegros.forEach((agujero) => {
      if (agujero && agujero.length >= 2) {
        const celdaAgujero = tabla.rows[agujero[1]].cells[agujero[0]];
        celdaAgujero.textContent = "⚫";
      }
    });
  }

  // Actualiza los agujeros de gusano
  if (move.agujerosGusano) {
    move.agujerosGusano.forEach((gusano) => {
      if (gusano.origen) {
        const celdaOrigen = tabla.rows[gusano.origen[1]].cells[gusano.origen[0]];
        celdaOrigen.textContent = "🕳️";
      }
      if (gusano.destino) {
        const celdaDestino = tabla.rows[gusano.destino[1]].cells[gusano.destino[0]];
        celdaDestino.textContent = "🕳️";
      }
    });
  }

  // Actualiza las estrellas
  if (move.estrellas) {
    move.estrellas.forEach((estrella) => {
      if (estrella && estrella.length >= 2) {
        const celdaEstrella = tabla.rows[estrella[1]].cells[estrella[0]];
        celdaEstrella.textContent = "🌟";
      }
    });
  }

  // Si hay un evento especial, muestra un indicador
  if (move.evento && move.evento !== "normal") {
    const mensaje = document.createElement("div");
    mensaje.classList.add("evento-mensaje");
    switch (move.evento) {
      case "recarga":
        mensaje.textContent = `⚡ Energía recargada: ${move.energia}`;
        break;
      case "portal":
        mensaje.textContent = "🕳️ Teletransporte activado";
        break;
      case "estrella":
        mensaje.textContent = "🌟 Campo gravitacional alterado";
        break;
    }
    tabla.parentElement.appendChild(mensaje);
    setTimeout(() => mensaje.remove(), 2000);
  }
};

const backtracking = (data) => { 
  let historial = []; 
  const result = iniciarBusqueda(
    data
  );
  console.log(result);
  
  if (!result) {
    alert(
      "❌ No se encontró un camino posible"
    );
    return;
  }
  for (let i = 0; i < result.historial.length; i++) {
    setTimeout(() => {
      const move = result.historial[i];
      actualizarMapa(move);
    }, i * 250);
  }
  
};

const loadDataForm = () => {
  // Captura los datos del formulario
  const dimensionesX = document.getElementById("dimensionesX").value;
  const dimensionesY = document.getElementById("dimensionesY").value;
  const inicioX = document.getElementById("inicioX").value;
  const inicioY = document.getElementById("inicioY").value;
  const finalX = document.getElementById("finX").value;
  const finalY = document.getElementById("finY").value;
  const agujerosNegros = document.getElementById("agujerosNegros").value;
  const estrellasGigantes = document.getElementById("estrellasGigantes").value;
  const agujerosGusano = document.getElementById("agujerosGusano").value;
  const celdasEnergia = document.getElementById("celdasEnergia").value;
  const enegiaInical = document.getElementById("energiaInicial").value;
  const inputMapa = {
    dimensionesX: parseInt(dimensionesX),
    dimensionesY: parseInt(dimensionesY),
    inicioX: parseInt(inicioX),
    inicioY: parseInt(inicioY),
    finalX: parseInt(finalX),
    finalY: parseInt(finalY),
    agujerosNegros: parseInt(agujerosNegros),
    estrellasGigantes: parseInt(estrellasGigantes),
    agujerosGusano: parseInt(agujerosGusano),
    celdasEnergia: parseInt(celdasEnergia),
    energiaInicial: parseInt(enegiaInical),
  };

  if (validaciones(inputMapa)) {
    // Si las validaciones son correctas, genera el mapa
    let mapa = generarMapa(inputMapa);
    mostrarMapa(mapa);
    const blob = new Blob([JSON.stringify(mapa, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mapa.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    backtracking(mapa);
  }
};

export const interestelar = () => {
  // Espera a que el DOM esté completamente cargado
  // Selecciona el botón
  const button = document.querySelector("#generarMapa");

  if (button) {
    // Maneja el evento click del botón
    button.addEventListener("click", (event) => {
      event.preventDefault(); // Evita que la página se recargue
      loadDataForm();
    });
  } else {
    console.error("El botón con ID 'generarMapa' no se encontró.");
  }

  const loadJson = document.querySelector("#cargarMapa");
  if (loadJson) {
    loadJson.addEventListener("click", (event) => {
      event.preventDefault(); // Evita que la página se recargue
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = JSON.parse(e.target.result);
          mostrarMapa(data);
          backtracking(data);
        };
        reader.readAsText(file);
      };
      input.click();
    });
  } else {
    console.error("El botón con ID 'cargarMapa' no se encontró.");
  }
};
