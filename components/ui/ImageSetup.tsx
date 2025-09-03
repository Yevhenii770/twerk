import Image from "next/image";

type ImageSetupProps = {
  alt: string;
  src: string;
  className?: string;
  variant?: "cover" | "contain";
};

export default function ImageSetup({
  alt,
  src,
  className = "",
  variant = "cover",
}: ImageSetupProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority
      className={`object-${variant} ${className}`}
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  );
}
