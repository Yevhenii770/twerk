type OverlayTitleProps = {
  text: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizes: Record<NonNullable<OverlayTitleProps["size"]>, string> = {
  sm: "text-3xl sm:text-4xl md:text-5xl",
  md: "text-3xl md:text-6xl",
  lg: "md:text-8xl text-6xl",
};

export default function OverlayTitle({
  text,
  className = "",
  size = "sm",
}: OverlayTitleProps) {
  return (
    <div className={`absolute top-0 left-0 p-6 ${className}`}>
      <h2 className={`${sizes[size]} font-bold text-white`}>{text}</h2>
    </div>
  );
}
