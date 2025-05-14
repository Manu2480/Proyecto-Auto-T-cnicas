const validaciones = (data) => {
  // Validaciones de los datos del formulario
  const { dimensionesX, dimensionesY, inicioX, inicioY, finalX, finalY, agujerosNegros, estrellasGigantes, agujerosGusano, celdasEnergia } = data;
  if (dimensionesX<30 || dimensionesY<30){
    alert("Las dimensiones del mapa deben ser mayores a 30");
    return false;
  }
  if (((inicioX < 0 || inicioY < 0) || (finalX < 0 || finalY < 0)) || 
      ((inicioX > dimensionesX || inicioY > dimensionesY) || (finalX > dimensionesX || finalY > dimensionesY))) {
    alert("Las coordenadas de inicio y fin deben estar dentro del mapa");
    return false;
  }
  if (inicioX == finalX && inicioY == finalY) {
    alert("Las coordenadas de inicio y fin no pueden ser iguales");
    return false;
  }
  if (agujerosNegros < 0 || agujerosNegros > (dimensionesX * dimensionesY) / 2) {
    alert("El número de agujeros en el mapa no puede ser menor a 0 o mayor a la mitad del mapa");
    return false;
  }
  if (estrellasGigantes < 0 || estrellasGigantes > agujerosNegros) {
    alert("El número de estrellas gigantes en el mapa no puede ser menor a 0 o mayor que la cantidad de agujeros negros");
    return false;
  }
  if (agujerosGusano < 0 || agujerosGusano > (dimensionesX * dimensionesY) / 3) {
    alert("El número de agujeros de gusano en el mapa no puede ser menor a 0 o mayor a un tercio del mapa");
    return false;
  }

  if (celdasEnergia < 0 || celdasEnergia > (dimensionesX * dimensionesY) / 10) {
    alert("El número de celdas de energía en el mapa no puede ser menor a 0 o mayor a un décimo del mapa");
    return false;
  }
  return true;
}



const generarObstaculos = (data) => {
  const posicionesUnicas = new Set();

  const generarPosicionUnica = (data) => {
    let x, y, key;
    do {
      x = Math.floor(Math.random() * data.dimensionesX);
      y = Math.floor(Math.random() * data.dimensionesY);
      key = `${x},${y}`;
    } while (posicionesUnicas.has(key) || (x === data.inicioX && y === data.inicioY) || (x === data.finalX && y === data.finalY));
    posicionesUnicas.add(key);
    return [x, y];
  };

  const agujerosNegros = [];
  const estrellasGigantes = [];
  const agujerosGusano = [];
  const celdasEnergia = [];

  for (let i = 0; i < data.agujerosNegros; i++) {
    agujerosNegros.push(generarPosicionUnica(data));
  }

  for (let i = 0; i < data.estrellasGigantes; i++) {
    estrellasGigantes.push(generarPosicionUnica(data));
  }

  for (let i = 0; i < data.agujerosGusano; i++) {
    const inicio = generarPosicionUnica(data);
    const fin = generarPosicionUnica(data);
    agujerosGusano.push({ inicio, fin });
  }

  for (let i = 0; i < data.celdasEnergia; i++) {
    let obj = {
      poscion: generarPosicionUnica(data),
      recarga: Math.floor(Math.random() * 4) + 2,
    }
    celdasEnergia.push(obj);
  }

  return { agujerosNegros, estrellasGigantes, agujerosGusano, celdasEnergia };
};



const generarMapa = (data) =>{
  let mapa = [[]];
  for (let i = 0; i < data.dimensionesX; i++) {
    mapa[i] = [];
    for (let j = 0; j < data.dimensionesY; j++) {
      mapa[i][j] = Math.floor(Math.random() * 10 ) + 1;
    }
  }
  mapa[data.inicioX][data.inicioY] = 0;
  mapa[data.finalX][data.finalY] = 0;
  
  const { agujerosNegros, estrellasGigantes, agujerosGusano, celdasEnergia } = generarObstaculos(data);

  celdasEnergia.array.forEach(celda => {
    mapa[celda.poscion[0]][celda.poscion[1]] = 0;
  });

  const backtraking = {
    matrix: {filas: data.dimensionesX, columnas: data.dimensionesY},
    origin: [data.inicioX, data.inicioY],
    destino: [data.finalX, data.finalY],
    agujerosNegros: agujerosNegros,
    estrellasGigantes: estrellasGigantes,
    agujerosGusano: agujerosGusano,
    celdasEnergia: celdasEnergia,
    mapa: mapa,
  }
/**
 * {
 * poscion: [x,y],
 * cargaActual: int,
 * agujerosNegros: [[x,y],...],
 * estrellasGigantes: [[x,y],...],
 * agujerosGusano: [{incio[x,y], destino:[x,y]},...],
 * celdasEnergia: [{poscicion: [x,y], recarga: int},...],
 * }
 * 
 */
  return backtraking
}


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
  };

  if(validaciones(inputMapa)){
    // Si las validaciones son correctas, genera el mapa
    let mapa = generarMapa(inputMapa);
    const blob = new Blob([JSON.stringify(mapa, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mapa.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
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
};
