type NewsTickerProps = {
  items: string[];
  className?: string;
  durationSec?: number;
};

export default function NewsTicker({
  items,
  className = "",
  durationSec = 20,
}: NewsTickerProps) {
  const Track = () => (
    <div className="flex shrink-0 items-center gap-16 px-8">
      {items.map((t, i) => (
        <span key={i} className="whitespace-nowrap font-medium">
          {t}
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={`relative overflow-hidden bg-blue-600 text-white py-2 ${className}`}
      style={{ "--marquee-duration": `${durationSec}s` } as React.CSSProperties}
    >
      <div className="flex w-[200%] animate-marquee">
        <Track />
        <Track />
      </div>
    </div>
  );
}
