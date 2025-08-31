import Image from "next/image";

type ImageSetupProps = {
  alt: string;
  src: string;
};
export default function ImageSetup({ alt, src }: ImageSetupProps) {
  return (
    <Image
      src={src}
      fill
      className="object-cover"
      sizes="(min-width:768px) 50vw, 100vw"
      alt={alt}
    />
  );
}
