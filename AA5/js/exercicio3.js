function removerPrimeiroEUltimoCaractere() {
    const stringOriginal = prompt("Digite uma string:");
    if (stringOriginal && stringOriginal.length > 2) {
        const stringModificada = stringOriginal.substring(1, stringOriginal.length - 1);
        alert(stringModificada);
    } else {
        alert("A string precisa ter mais de 2 caracteres.");
    }
}
