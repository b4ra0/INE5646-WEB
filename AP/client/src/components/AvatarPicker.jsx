// client/src/components/AvatarPicker.jsx
import React, { useEffect, useRef, useState } from 'react';

export default function AvatarPicker({ value, onChange }) {
  const [tab, setTab] = useState('file'); // 'file' | 'webcam'
  const [preview, setPreview] = useState(value || '');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // sincroniza preview com valor externo (carregado do backend)
  useEffect(() => {
    setPreview(value || '');
  }, [value]);

  // liga/desliga webcam conforme a aba
  useEffect(() => {
    if (tab === 'webcam') {
      startWebcam();
    } else {
      stopWebcam();
    }

    // cleanup ao desmontar
    return () => {
      stopWebcam();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function startWebcam() {
    try {
      if (streamRef.current) return; // já está ligada

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Erro ao acessar webcam', err);
      alert('Não foi possível acessar a webcam.');
    }
  }

  function stopWebcam() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  function captureFromWebcam() {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (!video.videoWidth || !video.videoHeight) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');

    setPreview(dataUrl);
    onChange?.(dataUrl);
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setPreview(dataUrl);
      onChange?.(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="avatar-picker-container">
      {/* Abas: Arquivo / Webcam */}
      <div className="row" style={{ marginBottom: 8 }}>
        <button
          type="button"
          className={'btn ' + (tab === 'file' ? 'primary' : 'gray')}
          onClick={() => setTab('file')}
        >
          Arquivo
        </button>

        <button
          type="button"
          className={'btn ' + (tab === 'webcam' ? 'primary' : 'gray')}
          onClick={() => setTab('webcam')}
        >
          Webcam
        </button>
      </div>

      {tab === 'file' && (
        <input type="file" accept="image/*" onChange={handleFileChange} />
      )}

      {tab === 'webcam' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <video
            ref={videoRef}
            style={{
              width: '100%',
              maxWidth: 400,
              borderRadius: 12,
              background: '#000',
            }}
          />
          <div className="row" style={{ gap: 8 }}>
            <button
              type="button"
              className="btn green"
              onClick={captureFromWebcam}
            >
              Capturar da webcam
            </button>
            <button
              type="button"
              className="btn gray"
              onClick={stopWebcam}
            >
              Fechar webcam
            </button>
          </div>
        </div>
      )}

      {/* Pré-visualização moderna */}
      <div className="avatar-preview-card">
        <div className="avatar-preview-header">
          <div className="avatar-preview-title">Pré-visualização</div>
          <div className="avatar-preview-subtitle">
            É assim que seu avatar aparecerá no ranking.
          </div>
        </div>

        <div className="avatar-preview-body">
          {preview ? (
            <img
              src={preview}
              alt="Pré-visualização do avatar"
              className="avatar-preview-img"
            />
          ) : (
            <span className="avatar-preview-empty">
              Nenhuma imagem selecionada ainda.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
