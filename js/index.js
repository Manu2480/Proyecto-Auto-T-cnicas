// Ensure the script is treated as a module
import { interestelar } from "./interestelar.js";


const main = () => {
    document
  .getElementById("loadInterestelar")
  .addEventListener("click", function () {
    // Selecciona la sección donde se cargará el contenido
    const interstellarSection = document.getElementById("interstellar");

    // Realiza una solicitud para obtener el contenido de interestelar.html
    fetch("html/interestelar.html")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al cargar el contenido");
        }
        return response.text();
      })
      .then((html) => {
        // Inserta el contenido en la sección
        interstellarSection.innerHTML = html;
        interestelar()
      })
      .catch((error) => {
        console.error("Error:", error);
        interstellarSection.innerHTML = "<p>Error al cargar el contenido.</p>";
      });
  });
}

main();