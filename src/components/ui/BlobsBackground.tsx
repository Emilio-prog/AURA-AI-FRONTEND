import { cn } from '@/utils/cn';

interface BlobsBackgroundProps {
  className?: string;
}

export function BlobsBackground({ className }: BlobsBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-white dark:bg-zinc-950',
        className,
      )}
    >
      <div className="absolute left-[-10%] top-[-20%] h-[60%] w-[60%] rounded-full bg-[rgba(100,230,210,0.35)] blur-[80px] dark:bg-[rgba(45,212,191,0.18)]" />
      <div className="absolute right-[-20%] top-[20%] h-[70%] w-[50%] rounded-full bg-[rgba(200,170,255,0.35)] blur-[80px] dark:bg-[rgba(168,85,247,0.18)]" />
      <div className="absolute bottom-[-20%] left-[20%] h-[60%] w-[60%] rounded-full bg-[rgba(255,180,190,0.35)] blur-[80px] dark:bg-[rgba(251,113,133,0.18)]" />
    </div>
  );
}
