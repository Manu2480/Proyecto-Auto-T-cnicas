/**
 * Autómata Finito para Validación de Códigos
 * 
 * Σ (Alfabeto): {# (dígitos 0-9), A (letras a-z, A-Z), - (guión)}
 * 
 * Q (Conjunto de Estados): {Q0, Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10, Q11, Q12, Q13}
 * 
 * q₀ (Estado Inicial): Q0
 * 
 * F (Estados de Aceptación): {Q13}
 * 
 * δ (Función de Transición): Definida por la matriz de transición
 *   - Valida códigos con formato: ####-##-#### (año-letras-número)
 *   - Q1 es el estado de error/rechazo
 *   - Controla que el año sea válido (19xx en adelante)
 */


export async function validarCodigosDesdeArchivo(file) {
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const lines = event.target.result.split(/\r?\n/);
            const resultados = [];
            let lineNumber = 1;

            for (const line of lines) {
                const cadena = line.trim();
                if (cadena.length === 0) {
                    lineNumber++;
                    continue;
                }
                const status = validarCodigo(cadena);
                resultados.push({
                    linea: lineNumber,
                    cadena,
                    status
                });
                lineNumber++;
            }

            resolve(resultados); // ahora devuelve todos, no solo los errores
        };

        reader.onerror = function(err) {
            reject(err);
        };

        reader.readAsText(file);
    });
}


export function validarCodigo(cod){
    // # Numero, A Letra, - Guion
    let estado = "Q0"; // estado oficial
    let estadoAux = "Q0"; // estado auxiliar para los errores
    const matrix = {
        "Q0": {"#":"Q2","A":"Q1","-":"Q1"},
        "Q1":{"#":"Q1","A":"Q1","-":"Q1"},
        "Q2":{"#":"Q3","A":"Q1","-":"Q1"},
        "Q3":{"#":"Q4","A":"Q1","-":"Q1"},
        "Q4":{"#":"Q5","A":"Q1","-":"Q1"},
        "Q5":{"#":"Q1","A":"Q1","-":"Q6"},
        "Q6":{"#":"Q1","A":"Q7","-":"Q1"},
        "Q7":{"#":"Q1","A":"Q8","-":"Q1"},
        "Q8":{"#":"Q1","A":"Q1","-":"Q9"},
        "Q9":{"#":"Q10","A":"Q1","-":"Q1"},
        "Q10":{"#":"Q11","A":"Q1","-":"Q1"},
        "Q11":{"#":"Q12","A":"Q1","-":"Q1"},
        "Q12":{"#":"Q13","A":"Q1","-":"Q1"},
        "Q13":{"#":"Q1","A":"Q1","-":"Q1"},

    };
    if (cod.length === 0) {
        return {estado: false, message: "El código no puede estar vacío"};
    }
    for (let i = 0; i < cod.length; i++) {
        const simbolo = cod[i];
        
        
        if(esLetra(simbolo)){
            if(!matrix[estado] || !matrix[estado]["A"]){
                return {estado: false, message: `Transición no válida en estado ${estado} con símbolo ${simbolo}`};
            }
            estadoAux = matrix[estado]["A"];
        }else if(esNumero(simbolo)){
            if(!matrix[estado] || !matrix[estado]["#"]){
                return {estado: false, message: `Transición no válida en estado ${estado} con símbolo ${simbolo}`};
            }
            // Validar el año (19xx - xxxx)
            if (estado === "Q0" && simbolo === '0') {
                return {estado: false, message: `Año no válido en estado ${estado} con símbolo ${simbolo}`};
            }
            if (estado === "Q2") {
                let aux = cod[i-1];                
                if (aux === '1' && simbolo != '9') {
                    return {estado: false, message: `Año no válido en estado ${estado} con símbolo ${simbolo}`};
                }
            }

            estadoAux = matrix[estado]["#"];
        }else if(simbolo === '-'){
            if(!matrix[estado] || !matrix[estado]["-"]){
                return {estado: false, message: `Transición no válida en estado ${estado} con símbolo ${simbolo}`};
            }
            estadoAux = matrix[estado]["-"];
        }else{
            return {estado: false, message: `Símbolo no válido: ${simbolo}`};
        }
        if (estadoAux === "Q1") {
            return {estado: false, message: `Transición no válida en estado ${estado} con símbolo ${simbolo}`};
        }
        estado = estadoAux;
    }

    const mensaje = {
        estado: estado === "Q13",
        message: estado === "Q13" ? `Código válido, estado final: ${estado}` : `Código no válido, estado final: ${estado}`
    }
    return mensaje;
}

function esNumero(simbolo) {
    return simbolo >= '0' && simbolo <= '9';
}

function esLetra(simbolo) {
    return (simbolo >= 'A' && simbolo <= 'Z') || (simbolo >= 'a' && simbolo <= 'z');
}

console.log(validarCodigo("1923-cd-0484")); // Ejemplo de uso