Instruções AA11
Implemente um Monitor de Mensagens TCP e UDP no servidor virtual da UFSC (VPS-UFSC), disponível em https://idufsc.ufsc.br/cloud/vps.



Siga as instruções a seguir:

Crie o server HTTP com o URL:
server_name.idUFSC.vms.ufsc.br/AA/AA11
Portas que deverão ser usadas:
Cliente TCP: 8080.
Cliente UDP: 8081.
Server (WebSocket: 8082).
Arquivos fornecidos:
index.html.
tcp_client.py.
udp_client.py.
ws.css.
ws.js (parcialmente implementado).
Estrutura no lado cliente:
Clients
│
├──tcp_client.py [porta 8080]
│
└──udp_client.py [porta 8081]
Estrutura sugerida no lado servidor:
Server VPS-UFSC [Ubuntu 24.04 LTS: porta 8082]
│
├──/etc
│  │
│  └──/apache2
│     │
│     └──/sites-available
│        │
│        └──000-default.conf
│           │  ┌──────────────────────────────────┐
│           └──│<VirtualHost *:80>                │
│              │                                  │
│              │    #...                          │
│              │                                  │
│              │    <Directory "/var/www/html">   │
│              │        Options +ExecCGI          │
│              │        DirectoryIndex index.html │
│              │        AddHandler cgi-script .py │
│              │        Require all granted       │
│              │    </Directory>                  │
│              │                                  │
│              │    #...                          │
│              │                                  │
│              │</VirtualHost>                    │
│              └──────────────────────────────────┘
└──/var
   │
   └──/www
      │
      └──/html
         │
         ├──/css
         │  │
         │  └──ws.css
         │
         ├──/js
         │  │
         │  └──ws.js
         │
         ├──/py
         │  │
         │  └──...
         │
         └──index.html
Vídeo de demonstração:
https://youtu.be/noa3qLCCLVk
Use o css fornecido (ws.css) para implementar o index.html.
Pede-se:
Arquivo README.md anexo à atividade, contendo a documentação e o roteiro completo de instalação e configuração.
Poderá adicionar no index.html da atividade, caso não queira adicionar na tarefa.
Arquivos de implementação da atividade, e.g. arquivos .py.
Também poderá adicionar no index.html, caso não queira adiconá-los na tarefa.
Escreva o URL do server na área de texto da atividade.
Indique a URL completa desta atividade, cuja página seja:
<restante_endereço>.vms.ufsc.br/AA/AA11/,
em que AA e AA11 são os diretórios para as Atividades Avaliadas (AA) e AA11 a atividade corrente.
Itens de avaliação:
O server deverá estabelecer conexões TCP e UDP. Este critério é necessário para pontuação da atividade.
Portanto, caso o server não estabeleça conexões TCP e UDP a nota será zero (0).
Se o server estalecer conexões TCP e não forem apresentados os arquivos README.md e .py. a nota máxima atribuída será seis (6).
Serão usados os clientes tcp_client.py e udp_client.py, cujo input será o URL do seu server websocket para testar o envio de mensagens para o server websocket implementado.
As mensagens deverão ser exibidas no server conforme vídeo de demonstração (https://youtu.be/noa3qLCCLVk).
Conteúdo do index.html, caso o server esteja funcionando:
Status do server:
Servidor online (ícone verde).
Servidor offline (ícone vermelho).
Iniciando servidor.
Verificando status do servidor.
Parando servidor.
Botão para iniciar o servidor.
Botão para parar o servidor.
Botão para limpar as mensagens.
Mensagens:
Flag TCP (quando usar cliente TCP) e flag UDP (quando usado o cliente UDP).
IP do cliente.
Data.
Hora.
Seletor de tipo de mensagem TCP, UDP ou todas.
Indicador de número de mensagens TCP, UDP e total de mensagens.
Opção de exibir e ocultar informações de depuração, e.g.:
[2025-05-13T17:47:31.849Z] Verificando status do servidor...
[2025-05-13T17:47:32.012Z] Status recebido:: [object Object]
[2025-05-13T17:47:32.012Z] Atualizando status do servidor: unknown
[2025-05-13T17:47:32.616Z] Solicitando início do servidor...
[2025-05-13T17:47:32.754Z] Resposta do início:: [object Object]
[2025-05-13T17:47:32.754Z] Atualizando status do servidor: running
[2025-05-13T17:47:32.754Z] Conectando ao WebSocket: ws://websocket.idUFSC.vms.ufsc.br:8082
[2025-05-13T17:47:33.090Z] WebSocket conectado
Em <footer> troque "Prof. Wyllian" pelo(s) autor(res).
Desafio-bônus:
0,5 ponto adicionado à P2, se:
Ao invés de desenvolver o server HTTP, implemente com websocket seguro (WSS) no HTTPS (SSL/TLS) do VPS-UFSC.
Os certificados podem ser autoassinados.
Anexe o roteiro detalhado de instalação e configuração no arquivo README.md.
Anexe todos os arquivos de configuração e instalação.
Caso faça alterações nos clientes, documente e os anexe na atividade.
Esta atividade deverá ser desenvolvida em grupo.

---

## Execução local (teste rápido)

Para facilitar o desenvolvimento e a validação local, incluí um servidor combinado (WebSocket + TCP + UDP) em `py/server_combined.py` que replica o comportamento esperado no VPS.

Passos mínimos para testar localmente (Linux):

1. Crie um ambiente Python 3.11+ (recomendado) e instale dependências:

   pip install -r AA11/py/requirements.txt

2. Inicie o servidor combinado (executar na pasta `AA11/py` ou usando caminho completo):

   python3 AA11/py/server_combined.py

   Isso abrirá:
   - WebSocket em ws://0.0.0.0:8082
   - TCP em 0.0.0.0:8080
   - UDP em 0.0.0.0:8081

3. Abra a página `AA11/index.html` em um navegador apontando para o servidor web (por exemplo, se estiver servindo via Apache ou abrindo arquivo localmente), e clique em "Iniciar Servidor" para conectar ao WebSocket.

4. Use os clientes fornecidos para enviar mensagens:

   - Cliente TCP: `AA11/py/tcp_client.py` — informe a URL do servidor (ex: `localhost:8080`) e envie mensagens.
   - Cliente UDP: `AA11/py/udp_client.py` — informe a URL do servidor (ex: `localhost:8081`) e envie mensagens.

As mensagens recebidas pelos sockets TCP/UDP serão encaminhadas ao(s) cliente(s) WebSocket conectados e exibidas no frontend com as flags TCP/UDP, IP, data/hora e conteúdo.

Observação: para submissão no VPS-UFSC siga as instruções originais do enunciado (configurar Apache, habilitar CGI para os scripts Python se desejar usar `server_manager.py`, ou rodar o `server_combined.py` em serviço separado e expor o WebSocket na porta 8082). Instruções detalhadas de deploy foram deixadas no corpo principal do enunciado e podem ser adicionadas neste README conforme o procedimento adotado no VPS.