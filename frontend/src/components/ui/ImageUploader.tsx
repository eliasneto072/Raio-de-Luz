import { useState, useRef } from 'react';
import { Upload, X, Loader2, ImagePlus } from 'lucide-react';
import { api } from '@/lib/api';

interface ImageUploaderProps {
  images: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}

export function ImageUploader({ images, onChange, max = 6 }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const remaining = max - images.length;
      const toUpload = Array.from(files).slice(0, remaining);
      const uploaded: string[] = [];

      for (const file of toUpload) {
        const formData = new FormData();
        formData.append('image', file);
        const { data } = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploaded.push(data.data.url);
      }

      onChange([...images, ...uploaded]);
    } catch (e) {
      setError((e as Error).message || 'Erro ao enviar imagem');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((url, i) => (
          <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-rosa-100 bg-rosa-50">
            <img src={url} alt={`Imagem ${i + 1}`} className="h-full w-full object-cover" />
            {i === 0 && (
              <span className="absolute left-1 top-1 rounded bg-rosa-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                Capa
              </span>
            )}
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-carvao/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remover"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-rosa-200 text-carvao/40 transition-colors hover:border-rosa-400 hover:text-rosa-500"
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <ImagePlus className="h-6 w-6" />
                <span className="text-xs">Adicionar</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      <p className="mt-2 text-xs text-carvao/40">
        <Upload className="mr-1 inline h-3 w-3" />
        JPG, PNG ou WebP até 5MB. A primeira imagem é a capa.
      </p>
      {error && <p className="mt-1 text-sm text-rosa-500">{error}</p>}
    </div>
  );
}
