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

  // Muestra los datos en la consola (puedes procesarlos como desees)
  console.log("Datos del formulario:", inputMapa);

  // Aquí puedes agregar lógica adicional para procesar los datos
  alert("Datos cargados correctamente. Revisa la consola para más detalles.");
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
