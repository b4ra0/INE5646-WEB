// client/src/components/RecordingControls.jsx
import React, { useEffect, useRef, useState } from 'react';

export default function RecordingControls({ lastGameId }) {

  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [shareUrl, setShareUrl] = useState(''); // URL do backend

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      stopStreams();
    };
  }, []);

  function stopStreams() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  async function startRecording() {
    setError('');
    setVideoUrl('');
    setShareUrl('');

    try {
      // captura tela+audio (aba do navegador, app, tela inteira)
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 24 },
        audio: true,
      });

      // opcionalmente, poderíamos mesclar microfone separado aqui
      streamRef.current = displayStream;

      const mediaRecorder = new MediaRecorder(displayStream, {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 4_000_000, // ~4 Mbit/s
        audioBitsPerSecond: 128_000,   // ~128 kbit/s
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        stopStreams();
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const localUrl = URL.createObjectURL(blob);
        setVideoUrl(localUrl);

        // sobe pro backend
        uploadVideo(blob).catch((err) => {
          console.error(err);
          setError('Erro ao enviar vídeo para o servidor.');
        });
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecording(true);
    } catch (err) {
      console.error('Erro ao iniciar gravação', err);
      setError('Não foi possível iniciar a gravação (permissão ou suporte do navegador).');
      stopStreams();
    }
  }

  function stopRecording() {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current = null;
    setRecording(false);
  }

async function uploadVideo(blob) {
  if (!blob) return;

  setUploading(true);
  setError('');

  try {
    if (!lastGameId) {
      throw new Error(
        'Nenhuma partida registrada para anexar o vídeo. Jogue e clique em "Check guesses & lock" antes de parar a gravação.'
      );
    }

    const formData = new FormData();
    formData.append('video', blob, 'partida.webm');
    formData.append('gameId', lastGameId); // <<< associa vídeo ao game

    const res = await fetch('/api/videos/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!res.ok) {
      let msg = 'Falha no upload';
      try {
        const data = await res.json();
        if (data?.error) msg = data.error;
      } catch (_) {}
      throw new Error(msg);
    }

    const data = await res.json();
    const url = data.shareUrl
      ? `${window.location.origin}${data.shareUrl}`
      : '';

    setShareUrl(url);
  } catch (err) {
    console.error('upload error', err);
    setError(err.message || 'Erro ao enviar vídeo para o servidor.');
  } finally {
    setUploading(false);
  }
}


  return (
    <div className="card section" style={{ marginTop: 16 }}>
      <h3>Gravação da partida</h3>
      <p className="small">
        Usa a captura de tela do navegador (display media). Clique em <b>Iniciar gravação</b>, jogue sua
        partida, depois clique em <b>Parar gravação</b>. O vídeo será salvo em WebM e enviado ao servidor.
      </p>

      <div className="row">
        <button
          className="btn primary"
          type="button"
          onClick={startRecording}
          disabled={recording || uploading}
        >
          {recording ? 'Gravando...' : 'Iniciar gravação'}
        </button>
        <button
          className="btn dark"
          type="button"
          onClick={stopRecording}
          disabled={!recording}
        >
          Parar gravação
        </button>
        {uploading && <span className="small">Enviando vídeo...</span>}
      </div>

      {error && <div style={{ color: 'red', fontSize: 12, marginTop: 8 }}>{error}</div>}

      {videoUrl && (
        <div style={{ marginTop: 12 }}>
          <div className="small">Pré-visualização local:</div>
          <video
            src={videoUrl}
            controls
            style={{ maxWidth: '100%', borderRadius: 8 }}
          />
        </div>
      )}

      {shareUrl && (
        <div style={{ marginTop: 12 }}>
          <div className="small">Link compartilhável (player simples):</div>
          <a href={shareUrl} target="_blank" rel="noreferrer">
            {shareUrl}
          </a>
        </div>
      )}
    </div>
  );
}
