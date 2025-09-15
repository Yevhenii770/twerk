type OverlayTitleProps = {
  text: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  textColor?: string;
};

const sizes: Record<NonNullable<OverlayTitleProps["size"]>, string> = {
  sm: "text-3xl sm:text-4xl md:text-5xl",
  md: "text-3xl md:text-6xl",
  lg: "text-3xl md:text-6xl",
};

export default function OverlayTitle({
  text,
  className = "",
  size = "sm",
  textColor = "text-white",
}: OverlayTitleProps) {
  return (
    <div className={`absolute top-0 left-0 p-6 ${className}`}>
      <h2 className={`${sizes[size]} font-bold ${textColor ?? "text-white"}`}>
        {text}
      </h2>
    </div>
  );
}
