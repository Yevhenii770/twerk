import Image from "next/image";

type ImageSetupProps = {
  src: string;
  alt: string;
  className?: string;
  variant?: "cover" | "contain";
  position?: string;
  priority?: boolean;
};

export default function ImageSetup({
  src,
  alt,
  className = "",
  variant = "cover",
  position = "center",
  priority = false,
}: ImageSetupProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      style={{ objectPosition: position }}
      className={`${
        variant === "cover" ? "object-cover" : "object-contain"
      } ${className}`}
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  );
}
