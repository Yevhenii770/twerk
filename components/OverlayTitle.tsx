type OverlayTitleProps = {
  text: string;
  className?: string;
};

export default function OverlayTitle({
  text,
  className = "",
}: OverlayTitleProps) {
  return (
    <div className={`absolute top-0 left-0 p-6 ${className}`}>
      <h2 className="text-5xl md:text-6xl font-bold text-white ">{text}</h2>
    </div>
  );
}
