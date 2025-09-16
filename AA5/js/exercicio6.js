function inverterString() {
    const stringOriginal = prompt("Digite uma string para inverter:");
    if (stringOriginal) {
        const stringInvertida = stringOriginal.split('').reverse().join('');
        console.log(stringInvertida);
    }
}
