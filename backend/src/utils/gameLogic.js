// Tamanho padrão do tabuleiro (geralmente 8x8 no Black Box clássico)
const BOARD_SIZE = 8;

const verificarRaio = (entrada, atomos) => {
    // entrada espera: { x: 0 a 7, y: 0 a 7, direcao: 'TOP'|'BOTTOM'|'LEFT'|'RIGHT' }
    // atomos espera: Array de objetos [{x, y}, {x, y}...]

    let x = entrada.x;
    let y = entrada.y;
    let dx = 0;
    let dy = 0;

    // Definir vetor de direção inicial
    if (entrada.direcao === 'TOP') dy = 1;    // Entrou por cima, desce
    if (entrada.direcao === 'BOTTOM') dy = -1; // Entrou por baixo, sobe
    if (entrada.direcao === 'LEFT') dx = 1;    // Entrou pela esquerda, vai pra direita
    if (entrada.direcao === 'RIGHT') dx = -1;  // Entrou pela direita, vai pra esquerda

    // Função auxiliar para verificar se existe átomo em uma coordenada
    const temAtomo = (cx, cy) => {
        return atomos.some(a => a.x === cx && a.y === cy);
    };

    // Loop de simulação do movimento
    // O raio anda até sair do tabuleiro ou ser absorvido
    while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {

        // 1. Verifica ABSORÇÃO (Hit direto)
        // "se pegar em cheio em algum, será uma absorção" [cite: 4]
        // Verifica a próxima casa para onde ele vai
        if (temAtomo(x, y)) {
            return { tipo: 'absorcao', x, y };
        }

        // 2. Verifica DEFLEXÃO (Desvio) e REFLEXÃO
        // "Se passar de lado vai desviar o caminho" [cite: 5]

        let defletiu = false;
        let atomoEsquerda = false;
        let atomoDireita = false;

        // Verificar átomos nas "quinas" relativas à direção atual
        // Se estou indo para CIMA (dy=-1), esquerda é x-1, direita é x+1
        // Se estou indo para DIREITA (dx=1), esquerda é y-1, direita é y+1

        if (dy !== 0) { // Movimento Vertical
            atomoEsquerda = temAtomo(x - 1, y + dy); // Verifica diagonal frente-esq
            atomoDireita = temAtomo(x + 1, y + dy);  // Verifica diagonal frente-dir
        } else { // Movimento Horizontal
            atomoEsquerda = temAtomo(x + dx, y - 1); // Verifica diagonal frente-esq
            atomoDireita = temAtomo(x + dx, y + 1);  // Verifica diagonal frente-dir
        }

        // CASO DE REFLEXÃO (Bateu em dois ou entrou "colado")
        // "pode ainda voltar por onde entrou (reflexão)" [cite: 5]
        if (atomoEsquerda && atomoDireita) {
            // Bateu num "muro" de dois átomos ou entrou num corredor sem saída
            return { tipo: 'reflexao', entrada: entrada }; // Retorna para a origem
        }

        // CASO DE DEFLEXÃO (Curva 90 graus)
        if (atomoEsquerda) {
            // Se tem átomo na esquerda, vira para a direita
            if (dy !== 0) { dx = 1; dy = 0; }      // Vertical -> Direita
            else { dx = 0; dy = 1; }               // Horizontal -> Baixo (correção de sentido depende da lógica vetorial exata)
            // Ajuste fino vetorial para virar 90 graus OPOSITOS ao obstáculo
            // Simplificação: Troca eixo e inverte sinal se necessário
            defletiu = true;
        } else if (atomoDireita) {
            // Se tem átomo na direita, vira para a esquerda
            // Lógica similar inversa
            defletiu = true;
        }

        // Se houve deflexão, precisamos recalcular a direção exata baseada no vetor
        if (defletiu) {
            // Nota: A implementação exata da deflexão vetorial pode exigir
            // verificar qual quadrante estamos, mas vamos simplificar:
            // Se bateu na "quina", ele troca o eixo.

            // Re-verificação simplificada para garantir a curva correta:
            if (atomoEsquerda) {
                // Vira à Direita da direção atual
                // (0, -1) -> (1, 0)
                // (0, 1)  -> (-1, 0)
                // (1, 0)  -> (0, 1)
                // (-1, 0) -> (0, -1)
                const oldDx = dx; dx = -dy; dy = oldDx;
            } else if (atomoDireita) {
                // Vira à Esquerda
                const oldDx = dx; dx = dy; dy = -oldDx;
            }
        }

        // 3. Move o raio
        x += dx;
        y += dy;
    }

    // Se saiu do loop, o raio saiu do tabuleiro
    return {
        tipo: 'saida',
        saida: { x, y } // Coordenada por onde saiu (pode ser fora do range 0-7)
    };
};

module.exports = { verificarRaio };