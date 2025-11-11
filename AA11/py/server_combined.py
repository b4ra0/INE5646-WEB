#!/usr/bin/env python3
"""
Servidor combinado para testes locais:
- WebSocket server: porta 8082
- TCP server: porta 8080
- UDP server: porta 8081

Ao receber mensagens TCP/UDP, o servidor as encaminha (JSON) para todos os clientes WebSocket conectados.

Uso:
    pip install -r requirements.txt
    python3 server_combined.py

"""
import asyncio
import json
import logging
import time
from typing import Set

import websockets

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s: %(message)s')

WS_PORT = 8082
TCP_PORT = 8080
UDP_PORT = 8081

connected_websockets: Set[websockets.WebSocketServerProtocol] = set()


async def broadcast(message: dict):
    if not connected_websockets:
        return
    data = json.dumps(message)
    to_remove = []
    for ws in connected_websockets:
        try:
            await ws.send(data)
        except Exception as e:
            logging.warning(f"Falha ao enviar para client WS: {e}")
            to_remove.append(ws)
    for r in to_remove:
        connected_websockets.discard(r)


async def ws_handler(ws, path):
    logging.info(f"WebSocket conectado: {ws.remote_address}")
    connected_websockets.add(ws)
    try:
        async for _ in ws:
            # Este servidor não espera mensagens do cliente WS, apenas mantém conexão
            pass
    finally:
        connected_websockets.discard(ws)
        logging.info(f"WebSocket desconectado: {ws.remote_address}")


async def handle_tcp(reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
    peer = writer.get_extra_info('peername')
    ip = peer[0] if peer else 'unknown'
    logging.info(f"Cliente TCP conectado: {ip}")
    try:
        while True:
            data = await reader.read(4096)
            if not data:
                break
            text = data.decode('utf-8', errors='replace').strip()
            logging.info(f"Recebido TCP de {ip}: {text}")
            payload = {
                'protocol': 'tcp',
                'ip': ip,
                'timestamp': int(time.time() * 1000),
                'message': text,
            }
            await broadcast(payload)
            # envia ACK simples
            writer.write(b'ACK')
            await writer.drain()
            if text.lower() in ('exit', 'quit'):
                break
    except Exception as e:
        logging.exception(f"Erro no handler TCP: {e}")
    finally:
        try:
            writer.close()
            await writer.wait_closed()
        except Exception:
            pass
        logging.info(f"Cliente TCP desconectado: {ip}")


class UDPServerProtocol(asyncio.DatagramProtocol):
    def connection_made(self, transport):
        self.transport = transport
        logging.info("Servidor UDP pronto")

    def datagram_received(self, data, addr):
        text = data.decode('utf-8', errors='replace').strip()
        ip = addr[0]
        logging.info(f"Recebido UDP de {ip}:{addr[1]}: {text}")
        payload = {
            'protocol': 'udp',
            'ip': ip,
            'timestamp': int(time.time() * 1000),
            'message': text,
        }
        # agende broadcast no loop
        asyncio.create_task(broadcast(payload))
        # responder ao remetente
        try:
            self.transport.sendto(b'ACK', addr)
        except Exception as e:
            logging.warning(f"Falha ao enviar ACK UDP: {e}")


async def main():
    logging.info(f"Iniciando WebSocket em 0.0.0.0:{WS_PORT}")
    ws_server = await websockets.serve(ws_handler, '0.0.0.0', WS_PORT)

    logging.info(f"Iniciando servidor TCP em 0.0.0.0:{TCP_PORT}")
    tcp_server = await asyncio.start_server(handle_tcp, '0.0.0.0', TCP_PORT)

    logging.info(f"Iniciando servidor UDP em 0.0.0.0:{UDP_PORT}")
    loop = asyncio.get_running_loop()
    transport, protocol = await loop.create_datagram_endpoint(
        lambda: UDPServerProtocol(), local_addr=('0.0.0.0', UDP_PORT)
    )

    try:
        await asyncio.gather(ws_server.wait_closed(), tcp_server.serve_forever())
    except asyncio.CancelledError:
        pass
    finally:
        transport.close()


if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logging.info('Servidor interrompido pelo usuário')
