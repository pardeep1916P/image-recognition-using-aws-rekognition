import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { colourFor, normalise } from '../utils';

interface BoundingBox {
  Left: number;
  Top: number;
  Width: number;
  Height: number;
}
interface Instance {
  BoundingBox?: BoundingBox;
  Confidence: number;
}
interface LabelAWS {
  Name: string;
  Confidence: number;
  Instances: Instance[];
}
const CONF_THRESHOLD = 80; 

const ImageLabeler: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageURL, setURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [allLabels, setAllLabels] = useState<LabelAWS[]>([]);
  const [showMore, setShowMore] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const onDrop = (accepted: File[]) => {
    if (!accepted.length) return;
    const f = accepted[0];
    setFile(f);
    setURL(URL.createObjectURL(f));
    setAllLabels([]);
    setShowMore(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    multiple: false,
    onDrop,
  });

  const drawBoxes = (labels: LabelAWS[]) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    labels.forEach((label) => {
      const nameNorm = normalise(label.Name);
      const colour = colourFor(nameNorm);
      label.Instances.forEach((inst) => {
        const b = inst.BoundingBox;
        if (!b || inst.Confidence < CONF_THRESHOLD) return;

        const x = b.Left * canvas.width;
        const y = b.Top * canvas.height;
        const w = b.Width * canvas.width;
        const h = b.Height * canvas.height;

        ctx.strokeStyle = colour;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);
        const tag = `${nameNorm.charAt(0).toUpperCase() + nameNorm.slice(1)} ${inst.Confidence.toFixed(1)}%`;
        ctx.font = 'bold 13px sans-serif';
        const pad = 4,
          th = 18,
          tw = ctx.measureText(tag).width;
        const tagW = Math.min(tw + pad * 2, w - 4);

        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(x + 2, y + 2, tagW, th);
        ctx.fillStyle = '#fff';
        ctx.fillText(tag, x + 2 + pad, y + 2 + th - 5);
      });
    });
  };

  const detectLabels = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/detect-labels`, { method: 'POST',body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const labels: LabelAWS[] = data.Raw?.Labels || data.TopLabels || [];
      const sorted = labels.sort((a, b) => b.Confidence - a.Confidence);
      setAllLabels(sorted);
      drawBoxes(sorted);
    } catch (err) {
      console.error(err);
      alert('Detection failed');
    } finally {
      setLoading(false);
    }
  };
  const clearAll = () => {
    setFile(null);
    setURL(null);
    setAllLabels([]);
    setShowMore(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const topLabel = allLabels.length ? allLabels[0] : null;

  return (
    <div className="image-wrapper">
      {!imageURL && (
        <div className="dropzone" {...getRootProps()}>
          <input {...getInputProps()} />
          <p>{isDragActive ? 'Drop it here 📂' : 'Drag an image or click “Upload Image”'}</p>
          <button type="button" className="primary-btn">
            Upload Image
          </button>
        </div>
      )}
      {imageURL && (
        <>
          <div style={{ position: 'relative' }}>
            <img
              ref={imgRef}
              src={imageURL}
              alt="preview"
              style={{ width: '100%', borderRadius: 12 }}
              onLoad={() => drawBoxes([])}
            />
            <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
            {loading && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backdropFilter: 'blur(2px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.6rem',
                  color: '#fff',
                }}
              >
                Detecting…
              </div>
            )}
          </div>
          {topLabel && (
            <div
              style={{
                marginTop: '1.25rem',
                background: 'rgba(255,255,255,0.07)',
                padding: '0.75rem 1rem',
                borderRadius: 10,
                color: '#fff',
                fontWeight: 500,
                maxWidth: 700,
                width: '100%',
                textAlign: 'center',
              }}
            >
              Best Match:&nbsp;
              <strong>{topLabel.Name}</strong>&nbsp;-&nbsp;{topLabel.Confidence.toFixed(1)}%
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
            <button type="button" className="secondary-btn" onClick={clearAll}>
              Choose another
            </button>
            <button type="button" className="primary-btn" onClick={detectLabels} disabled={loading}>
              Detect
            </button>
            {allLabels.length > 0 && (
              <button type="button" className="secondary-btn" onClick={() => setShowMore((prev) => !prev)}>
                {showMore ? 'Less ▲' : 'More ▼'}
              </button>
            )}
          </div>
          {showMore && (
            <div className="label-panel">
              <h3>All Labels</h3>
              <ul>
                {allLabels.map((l) => (
                  <li key={l.Name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{l.Name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 80,
                          height: 8,
                          borderRadius: 4,
                          background: '#333',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${l.Confidence}%`,
                            height: '100%',
                            background: '#32ff72',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.9rem', minWidth: 40 }}>{l.Confidence.toFixed(1)}%</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ImageLabeler;
