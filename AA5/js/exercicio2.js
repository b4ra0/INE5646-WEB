function tratadorDeCliqueExercicio2() {
    // atualize esta função para
    // exibir um alerta com a hora 
    // atual no seguinte formato:
    // Horário: 8 PM : 40m : 28s    
    const data = new Date();
    let horas = data.getHours();
    const minutos = data.getMinutes();
    const segundos = data.getSeconds();
    const ampm = horas >= 12 ? 'PM' : 'AM';

    horas = horas % 12;
    horas = horas ? horas : 12;

    alert(`Horário: ${horas} ${ampm} : ${minutos}m : ${segundos}s`);
}
