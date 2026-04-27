import { cn } from '@/utils/cn';

interface BlobsBackgroundProps {
  className?: string;
}

/**
 * Blobs decorativos fijos replicados del panel HTML de referencia.
 * Se renderizan detrás de todo el contenido (z-0 con pointer-events-none).
 */
export function BlobsBackground({ className }: BlobsBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none fixed inset-0 -z-10 overflow-hidden', className)}
    >
      {/* Teal — top-center */}
      <div
        className="absolute -top-20 left-1/4 h-[520px] w-[520px] rounded-full"
        style={{ background: 'rgba(45,212,191,0.35)', filter: 'blur(80px)' }}
      />
      {/* Purple — bottom-right */}
      <div
        className="absolute -right-32 bottom-[-180px] h-[640px] w-[640px] rounded-full"
        style={{ background: 'rgba(168,85,247,0.35)', filter: 'blur(80px)' }}
      />
      {/* Coral — mid-left */}
      <div
        className="absolute -left-16 top-[45%] h-[420px] w-[420px] rounded-full"
        style={{ background: 'rgba(251,113,133,0.35)', filter: 'blur(80px)' }}
      />
    </div>
  );
}
