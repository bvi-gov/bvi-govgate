'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ScanLine,
  Camera,
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminScanner() {
  const [mode, setMode] = useState<'camera' | 'upload' | null>(null);
  const [capturedImages, setCapturedImages] = useState<{
    id: string;
    file: File;
    preview: string;
    ocrText: string | null;
    ocrLoading: boolean;
  }[]>([]);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState('');
  const [processing, setProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      setCameraError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraError('Camera access denied. Please allow camera permissions and try again.');
      console.error('Camera error:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  }, [cameraStream]);

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    }
    return () => stopCamera();
  }, [mode, startCamera, stopCamera]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const preview = URL.createObjectURL(blob);
      const id = `img-${Date.now()}`;

      setCapturedImages(prev => [...prev, {
        id, file, preview, ocrText: null, ocrLoading: false
      }]);

      toast.success('Photo captured successfully!');
    }, 'image/jpeg', 0.9);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const preview = URL.createObjectURL(file);
      const id = `img-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      setCapturedImages(prev => [...prev, {
        id, file, preview, ocrText: null, ocrLoading: false
      }]);
    });

    toast.success(`${files.length} file(s) uploaded successfully!`);
    e.target.value = '';
  };

  const extractTextOCR = async (imageId: string) => {
    setCapturedImages(prev => prev.map(img =>
      img.id === imageId ? { ...img, ocrLoading: true } : img
    ));

    try {
      const image = capturedImages.find(img => img.id === imageId);
      if (!image) return;

      const formData = new FormData();
      formData.append('file', image.file);

      const res = await fetch('/api/documents/ocr', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setCapturedImages(prev => prev.map(img =>
          img.id === imageId ? { ...img, ocrText: data.text, ocrLoading: false } : img
        ));
        toast.success('Text extracted successfully!');
      } else {
        throw new Error('OCR failed');
      }
    } catch {
      setCapturedImages(prev => prev.map(img =>
        img.id === imageId ? { ...img, ocrLoading: false } : img
      ));
      toast.error('Failed to extract text. Please try again.');
    }
  };

  const extractAllText = async () => {
    setProcessing(true);
    for (const img of capturedImages) {
      if (!img.ocrText && !img.ocrLoading) {
        await extractTextOCR(img.id);
      }
    }
    setProcessing(false);
  };

  const removeImage = (id: string) => {
    setCapturedImages(prev => prev.filter(img => img.id !== id));
  };

  const allText = capturedImages.map(img => img.ocrText).filter(Boolean).join('\n\n---\n\n');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#009B3A]/10 rounded-xl flex items-center justify-center">
            <ScanLine className="w-5 h-5 text-[#009B3A]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Document Scanner</h1>
            <p className="text-sm text-gray-400">Capture or upload documents and extract text with OCR</p>
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      {!mode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <button
            onClick={() => setMode('camera')}
            className="flex flex-col items-center gap-4 p-8 bg-[#131F2E] border border-[#1E3A5F] rounded-xl hover:border-[#009B3A]/50 transition-all group"
          >
            <div className="w-16 h-16 bg-[#009B3A]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#009B3A]/20 transition-all">
              <Camera className="w-8 h-8 text-[#009B3A]" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-1">Camera Capture</h3>
              <p className="text-sm text-gray-400">Use your device camera to scan documents</p>
            </div>
          </button>

          <button
            onClick={() => setMode('upload')}
            className="flex flex-col items-center gap-4 p-8 bg-[#131F2E] border border-[#1E3A5F] rounded-xl hover:border-[#009B3A]/50 transition-all group"
          >
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
              <Upload className="w-8 h-8 text-blue-400" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-1">File Upload</h3>
              <p className="text-sm text-gray-400">Upload photos, PDFs, or scanned documents</p>
            </div>
          </button>
        </div>
      )}

      {/* Camera View */}
      {mode === 'camera' && (
        <div className="space-y-4">
          <div className="relative bg-black rounded-xl overflow-hidden">
            {cameraError ? (
              <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-400">
                <AlertCircle className="w-10 h-10 mb-3 text-red-400" />
                <p className="text-sm">{cameraError}</p>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full max-h-[500px] object-contain"
                />
                <canvas ref={canvasRef} className="hidden" />
                {/* Capture overlay */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                  <Button
                    onClick={capturePhoto}
                    size="lg"
                    className="bg-[#009B3A] text-white hover:bg-[#007A2E] rounded-full w-16 h-16 p-0"
                  >
                    <Camera className="w-8 h-8" />
                  </Button>
                </div>
                {/* Corner guides */}
                <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-white/50 rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-white/50 rounded-tr-lg" />
                <div className="absolute bottom-16 left-4 w-12 h-12 border-b-2 border-l-2 border-white/50 rounded-bl-lg" />
                <div className="absolute bottom-16 right-4 w-12 h-12 border-b-2 border-r-2 border-white/50 rounded-br-lg" />
              </>
            )}
          </div>
          <Button variant="ghost" onClick={() => { stopCamera(); setMode(null); }} className="text-gray-400 hover:text-white">
            Back to Selection
          </Button>
        </div>
      )}

      {/* Upload View */}
      {mode === 'upload' && (
        <div className="space-y-4">
          <label className="flex flex-col items-center justify-center p-12 bg-[#131F2E] border-2 border-dashed border-[#1E3A5F] rounded-xl hover:border-[#009B3A]/50 transition-all cursor-pointer group">
            <Upload className="w-12 h-12 text-gray-500 group-hover:text-[#009B3A] transition-colors mb-4" />
            <p className="text-white font-medium mb-1">Drop files here or click to upload</p>
            <p className="text-xs text-gray-500">Supports JPG, PNG, PDF, BMP</p>
            <input
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <Button variant="ghost" onClick={() => setMode(null)} className="text-gray-400 hover:text-white">
            Back to Selection
          </Button>
        </div>
      )}

      {/* Captured Images Gallery */}
      {capturedImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Scanned Documents ({capturedImages.length})
            </h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={extractAllText}
                disabled={processing || capturedImages.every(img => img.ocrText)}
                className="bg-[#009B3A] text-white hover:bg-[#007A2E] text-xs"
              >
                {processing ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5 mr-1" />
                )}
                Extract All Text
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {capturedImages.map((img) => (
              <div key={img.id} className="bg-[#131F2E] border border-[#1E3A5F] rounded-xl overflow-hidden">
                <div className="relative">
                  <img
                    src={img.preview}
                    alt="Scanned document"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {img.ocrText ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> OCR Done
                      </Badge>
                    ) : img.ocrLoading ? (
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Processing
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => extractTextOCR(img.id)}
                        className="bg-black/50 text-white hover:bg-black/70 text-[10px] h-6"
                      >
                        Extract Text
                      </Button>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-2 left-2 bg-black/50 text-red-400 hover:bg-red-500/20 text-[10px] h-6 w-6 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-400 mb-1 truncate">{img.file.name}</p>
                  <p className="text-[10px] text-gray-600">{(img.file.size / 1024).toFixed(1)} KB</p>
                  {img.ocrText && (
                    <div className="mt-2 p-2 bg-[#0C1B2A] rounded-lg max-h-32 overflow-y-auto">
                      <p className="text-[11px] text-gray-300 whitespace-pre-wrap">{img.ocrText.substring(0, 500)}{img.ocrText.length > 500 ? '...' : ''}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Combined OCR Output */}
          {allText && (
            <div className="bg-[#131F2E] border border-[#1E3A5F] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Extracted Text (All Documents)</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(allText);
                    toast.success('Text copied to clipboard!');
                  }}
                  className="text-gray-400 text-xs h-7"
                >
                  Copy All
                </Button>
              </div>
              <pre className="text-xs text-gray-300 bg-[#0C1B2A] rounded-lg p-4 max-h-64 overflow-y-auto whitespace-pre-wrap font-mono">
                {allText}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
