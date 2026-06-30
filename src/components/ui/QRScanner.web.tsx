import { useEffect, useRef, useState } from "react";

type Props = {
  onScan: (data: string) => void;
  active: boolean;
};

export default function QRScanner({ onScan, active }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
          scan();
        }
      } catch (e: any) {
        setError("No se pudo acceder a la cámara. Verificá los permisos del navegador.");
      }
    }

    async function scan() {
      if (cancelled) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(scan);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Dynamically import jsQR to avoid SSR issues
      const jsQR = (await import("jsqr")).default;
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code?.data) {
        onScan(code.data);
        return; // Stop scanning after first hit
      }

      rafRef.current = requestAnimationFrame(scan);
    }

    start();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setReady(false);
    };
  }, [active]);

  if (error) {
    return (
      <div style={{
        width: "100%", height: "100%",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 12, padding: 24, boxSizing: "border-box",
        background: "#1a1a1a", color: "#fff",
        fontFamily: "'DM Sans', -apple-system, sans-serif",
      }}>
        <span style={{ fontSize: 40 }}>📷</span>
        <p style={{ textAlign: "center", fontSize: 15, color: "#ccc", margin: 0 }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "#000", overflow: "hidden" }}>
      <video
        ref={videoRef}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        playsInline
        muted
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Visor con esquinas */}
      {ready && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {/* Overlay oscuro con hueco central */}
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(0,0,0,0.55)",
            maskImage: "radial-gradient(ellipse 220px 220px at center, transparent 0%, black 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 220px 220px at center, transparent 0%, black 100%)",
          }} />
          {/* Marco del scanner */}
          <div style={{
            width: 220, height: 220,
            position: "relative",
            borderRadius: 16,
          }}>
            {/* Esquinas */}
            {[
              { top: 0, left: 0, borderTop: "3px solid #fff", borderLeft: "3px solid #fff", borderTopLeftRadius: 10 },
              { top: 0, right: 0, borderTop: "3px solid #fff", borderRight: "3px solid #fff", borderTopRightRadius: 10 },
              { bottom: 0, left: 0, borderBottom: "3px solid #fff", borderLeft: "3px solid #fff", borderBottomLeftRadius: 10 },
              { bottom: 0, right: 0, borderBottom: "3px solid #fff", borderRight: "3px solid #fff", borderBottomRightRadius: 10 },
            ].map((corner, i) => (
              <div key={i} style={{
                position: "absolute", width: 32, height: 32, ...corner,
              }} />
            ))}
          </div>
        </div>
      )}

      {!ready && !error && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 14,
          fontFamily: "'DM Sans', -apple-system, sans-serif",
        }}>
          Iniciando cámara…
        </div>
      )}
    </div>
  );
}
