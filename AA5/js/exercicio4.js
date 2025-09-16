function verificarIntervalos() {
    const num1 = parseInt(prompt("Digite o primeiro número:"));
    const num2 = parseInt(prompt("Digite o segundo número:"));

    function checarNumero(num) {
        if ((num >= 30 && num <= 50)) {
            console.log(`${num} está no intervalo [30,50].`);
        } else if ((num >= 60 && num <= 100)) {
            console.log(`${num} está no intervalo [60,100].`);
        } else {
            console.log(`O número ${num} não está em nenhum dos dois intervalos.`);
        }
    }

    checarNumero(num1);
    checarNumero(num2);
}
