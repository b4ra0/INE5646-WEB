function obterRegiaoFiscalAtravesDoCPFInformado(cpfInformado) {
    //edite esta função!
    let regiaoFiscal = undefined
    console.log(cpfInformado)
    
    if (cpfInformado && cpfInformado.length >= 9) {
        const nonoDigito = cpfInformado.charAt(8);
        switch (nonoDigito) {
            case '1': 
            	return "DF, GO, MT, MS e TO";
            case '2': 
            	return "AC, AP, AM, PA, RO e RR";
            case '3': 
            	return "CE, MA e PI";
            case '4': 
            	return "AL, PB, PE e RN";
            case '5': 
            	return "BA e SE";
            case '6': 
            	return "MG";
            case '7': 
            	return "ES e RJ";
            case '8': 
            	return "SP";
            case '9': 
            	return "PR e SC";
            case '0': 
            	return "RS";
            default: 
            	return "Dígito da região fiscal inválido";
        }
    }
    
    //----------------------------
    return regiaoFiscal
}



function tratadorDeCliqueExercicio8() {
    let textCPF = document.getElementById("textCPF")
	let textRegiao = document.getElementById("regiaoFiscal")

    const regiaoFiscal = obterRegiaoFiscalAtravesDoCPFInformado(textCPF.value);
    textRegiao.textContent = "Região fiscal: "+regiaoFiscal
}
