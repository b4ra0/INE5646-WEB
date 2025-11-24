import React, { useState, useEffect } from 'react';
import Board from './Board';
import api from './api';

// Função auxiliar para gerar átomos aleatórios (escondidos)
const gerarAtomos = (qtd = 5) => {
    const atomos = [];
    while (atomos.length < qtd) {
        const x = Math.floor(Math.random() * 8);
        const y = Math.floor(Math.random() * 8);
        // Evita átomos na mesma posição
        if (!atomos.some(a => a.x === x && a.y === y)) {
            atomos.push({ x, y });
        }
    }
    return atomos;
};

function App() {
    const [theme, setTheme] = useState('light');
    const [partidaId, setPartidaId] = useState(null); // ID da partida atual
    const [status, setStatus] = useState('Sem jogo iniciado');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    // Função para Iniciar o Jogo no Backend
    const iniciarJogo = async () => {
        try {
            setStatus('Criando partida...');
            // Gera 5 átomos aleatórios
            const atomosSecretos = gerarAtomos(5);

            // Manda pro Backend salvar (POST /partidas)
            // Nota: Estamos usando um ID de usuário fictício por enquanto
            const response = await api.post('/partidas', {
                jogadorId: '65f2d5a0e4b0a1b2c3d4e5f6', // ID fake só pra testar (depois pegamos do login)
                modoJogo: 'humanos',
                atomos: atomosSecretos
            });

            setPartidaId(response.data._id); // Guarda o ID que o Mongo gerou
            setStatus('Partida em andamento! Atire os raios.');
            console.log('Partida criada:', response.data);

        } catch (error) {
            console.error('Erro ao criar partida:', error);
            setStatus('Erro ao conectar com o servidor.');
        }
    };

    return (
        <div className="container">
            <button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <h1>Black Box Web</h1>

            <div className="controls">
                <p>Status: <strong>{status}</strong></p>
                <button
                    onClick={iniciarJogo}
                    style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', marginBottom: '20px' }}
                >
                    {partidaId ? 'Reiniciar Jogo' : 'Iniciar Nova Partida'}
                </button>
            </div>

            {/* Passamos o ID da partida para o Tabuleiro saber onde atirar */}
            <Board partidaId={partidaId} />
        </div>
    );
}

export default App;