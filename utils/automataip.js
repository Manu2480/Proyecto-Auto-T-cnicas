function validarIp(ip){
    if (typeof ip !== 'string') {
        return {estado:false, message: "La IP debe ser una cadena de texto"};
    }
    const partes = [];
    let parte = '';
    for (let i = 0; i < ip.length; i++) {        
        if (!['.', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(ip[i])) {
            return {estado:false, message:"La ip contiene caracteres no validos"};
        }
        if (ip[i] === '.') {
            partes.push(parte+'.');
            parte = '';
        } else {
            parte += ip[i];
        }
    }
    partes.push(parte);
    if (partes.length !== 4) {
        return {estado: false, message: "La IP debe tener 4 partes separadas por puntos"};
    }
    for(let i = 0; i<partes.length; i++){
        if(i!=3){
            let validacion = validarIpAux(partes[i]);
            if(!validacion.estado){
                return validacion;
            }
        }else{
            let validacion = validarIpFinal(partes[i]);
            if(!validacion.estado){
                return validacion;
            }
        }
    }
    return {estado: true, message: "La IP es válida"};



}

function validarIpAux(parte){
    let estado = "Q0";
    if(parte.length === 0){
        return {estado: false, message: "La última parte de la IP no puede estar vacía"};
    }
    const matrix = {
        "Q0": { ".": "Q1", "0": "Q5", "1": "Q2", "2": "Q3", "3": "Q4", "4": "Q4", "5": "Q4", "6": "Q4", "7": "Q4", "8": "Q4", "9": "Q4" },
        "Q1": { ".": "Q1", "0": "Q1", "1": "Q1", "2": "Q1", "3": "Q1", "4": "Q1", "5": "Q1", "6": "Q1", "7": "Q1", "8": "Q1", "9": "Q1" },
        "Q2": { ".": "Q14", "0": "Q6", "1": "Q6", "2": "Q6", "3": "Q6", "4": "Q6", "5": "Q6", "6": "Q6", "7": "Q6", "8": "Q6", "9": "Q6" },
        "Q3": { ".": "Q14", "0": "Q10", "1": "Q10", "2": "Q10", "3": "Q10", "4": "Q10", "5": "Q8", "6": "Q9", "7": "Q9", "8": "Q9", "9": "Q9" },
        "Q4": { ".": "Q14", "0": "Q11", "1": "Q11", "2": "Q11", "3": "Q11", "4": "Q11", "5": "Q11", "6": "Q11", "7": "Q11", "8": "Q11", "9": "Q11" },
        "Q5": { ".": "Q14", "0": "Q1", "1": "Q1", "2": "Q1", "3": "Q1", "4": "Q1", "5": "Q1", "6": "Q1", "7": "Q1", "8": "Q1", "9": "Q1" },
        "Q6": { ".": "Q14", "0": "Q7", "1": "Q7", "2": "Q7", "3": "Q7", "4": "Q7", "5": "Q7", "6": "Q7", "7": "Q7", "8": "Q7", "9": "Q7" },
        "Q7": { ".": "Q14", "0": "Q1", "1": "Q1", "2": "Q1", "3": "Q1", "4": "Q1", "5": "Q1", "6": "Q1", "7": "Q1", "8": "Q1", "9": "Q1" },
        "Q8": { ".": "Q14", "0": "Q13", "1": "Q13", "2": "Q13", "3": "Q13", "4": "Q13", "5": "Q13", "6": "Q1", "7": "Q1", "8": "Q1", "9": "Q1" },
        "Q9": { ".": "Q14", "0": "Q1", "1": "Q1", "2": "Q1", "3": "Q1", "4": "Q1", "5": "Q1", "6": "Q1", "7": "Q1", "8": "Q1", "9": "Q1" },
        "Q10": { ".": "Q14", "0": "Q12", "1": "Q12", "2": "Q12", "3": "Q12", "4": "Q12", "5": "Q12", "6": "Q12", "7": "Q12", "8": "Q12", "9": "Q12" },
        "Q11": { ".": "Q14", "0": "Q1", "1": "Q1", "2": "Q1", "3": "Q1", "4": "Q1", "5": "Q1", "6": "Q1", "7": "Q1", "8": "Q1", "9": "Q1" },
        "Q12": { ".": "Q14", "0": "Q1", "1": "Q1", "2": "Q1", "3": "Q1", "4": "Q1", "5": "Q1", "6": "Q1", "7": "Q1", "8": "Q1", "9": "Q1" },
        "Q13": { ".": "Q14", "0": "Q1", "1": "Q1", "2": "Q1", "3": "Q1", "4": "Q1", "5": "Q1", "6": "Q1", "7": "Q1", "8": "Q1", "9": "Q1" },
        "Q14": { ".": "Q1", "0": "Q1", "1": "Q1", "2": "Q1", "3": "Q1", "4": "Q1", "5": "Q1", "6": "Q1", "7": "Q1", "8": "Q1", "9": "Q1" }
    }
    for (let i = 0; i < parte.length; i++) {
         const simbolo = parte[i];
        
        // Check if transition exists
        if (!matrix[estado] || !matrix[estado][simbolo]) {
            return {estado: false, message: `Transición no válida en estado ${estado} con símbolo ${simbolo}`};
        }
        
        if (matrix[estado][simbolo] === "Q1") {
            return {estado: false, message: `Transición no válida en estado ${estado} con símbolo ${simbolo}`};
        }
        
        estado = matrix[estado][simbolo];
    }
    let retorno = {};
    if(estado === "Q14"){
        retorno.estado = true;
        retorno.message = `IP válida, estado final: ${estado}`;
    }
    else{
        retorno.estado = false;
        retorno.message = `IP no válida, estado final: ${estado}`;
    }
    return retorno;
}

function validarIpFinal(parte){
    let estado = "Q0";
    if(parte.length === 0){
        return {estado: false, message: "La última parte de la IP no puede estar vacía"};
    }
    const matrix = {
        "Q0": { ".": "Q1", "0": "Q5", "1": "Q2", "2": "Q3", "3": "Q4", "4": "Q4", "5": "Q4", "6": "Q4", "7": "Q4", "8": "Q4", "9": "Q4" },
        "Q1": { ".": "Q1", "0": "Q1", "1": "Q1", "2": "Q1", "3": "Q1", "4": "Q1", "5": "Q1", "6": "Q1", "7": "Q1", "8": "Q1", "9": "Q1" },
        "Q2": { ".": "Q1", "0": "Q6", "1": "Q6", "2": "Q6", "3": "Q6", "4": "Q6", "5": "Q6", "6": "Q6", "7": "Q6", "8": "Q6", "9": "Q6" },
        "Q3": { ".": "Q1", "0": "Q10", "1": "Q10", "2": "Q10", "3": "Q10", "4": "Q10", "5": "Q8", "6": "Q9", "7": "Q9", "8": "Q9", "9": "Q9" },
        "Q4": { ".": "Q1", "0": "Q11", "1": "Q11", "2": "Q11", "3": "Q11", "4": "Q11", "5": "Q11", "6": "Q11", "7": "Q11", "8": "Q11", "9": "Q11" },
        "Q5": { ".": "Q1", "0": "Q1", "1": "Q1", "2": "Q1", "3": "Q1", "4": "Q1", "5": "Q1", "6": "Q1", "7": "Q1", "8": "Q1", "9": "Q1" },
        "Q6": { ".": "Q1", "0": "Q7", "1": "Q7", "2": "Q7", "3": "Q7", "4": "Q7", "5": "Q7", "6": "Q7", "7": "Q7", "8": "Q7", "9": "Q7" },
        "Q7": { ".": "Q1", "0": "Q1", "1": "Q1", "2": "Q1", "3": "Q1", "4": "Q1", "5": "Q1", "6": "Q1", "7": "Q1", "8": "Q1", "9": "Q1" },
        "Q8": { ".": "Q1", "0": "Q13", "1": "Q13", "2": "Q13", "3": "Q13", "4": "Q13", "5": "Q13", "6": "Q1", "7": "Q1", "8": "Q1", "9": "Q1" },
        "Q9": { ".": "Q1", "0": "Q1", "1": "Q1", "2": "Q1", "3": "Q1", "4": "Q1", "5": "Q1", "6": "Q1", "7": "Q1", "8": "Q1", "9": "Q1" },
        "Q10": { ".": "Q1", "0": "Q12", "1": "Q12", "2": "Q12", "3": "Q12", "4": "Q12", "5": "Q12", "6": "Q12", "7": "Q12", "8": "Q12", "9": "Q12" },
        "Q11": { ".": "Q1", "0": "Q1", "1": "Q1", "2": "Q1", "3": "Q1", "4": "Q1", "5": "Q1", "6": "Q1", "7": "Q1", "8": "Q1", "9": "Q1" },
        "Q12": { ".": "Q1", "0": "Q1", "1": "Q1", "2": "Q1", "3": "Q1", "4": "Q1", "5": "Q1", "6": "Q1", "7": "Q1", "8": "Q1", "9": "Q1" },
        "Q13": { ".": "Q1", "0": "Q1", "1": "Q1", "2": "Q1", "3": "Q1", "4": "Q1", "5": "Q1", "6": "Q1", "7": "Q1", "8": "Q1", "9": "Q1" },
    }
    for (let i = 0; i < parte.length; i++) {
         const simbolo = parte[i];
        
        // Check if transition exists
        if (!matrix[estado] || !matrix[estado][simbolo]) {
            return {estado: false, message: `Transición no válida en estado ${estado} con símbolo ${simbolo}`};
        }
        
        if (matrix[estado][simbolo] === "Q1") {
            return {estado: false, message: `Transición no válida en estado ${estado} con símbolo ${simbolo}`};
        }
        
        estado = matrix[estado][simbolo];
    }
    let retorno = {}

    if(estado != "Q1"){
        retorno.estado = true;
        retorno.message = `IP válida, estado final: ${estado}`;
    }
    else{
        retorno.estado = false;
        retorno.message = `IP no válida, estado final: ${estado}`;
    }
    return retorno;

}

//se exporto la función para poder llamarla desde otros archivos
export { validarIp };