import { ImageSetup } from "./ui";

const FounderCard = ({
  src,
  title,
  position,
  color = "bg-fuchsia-500",
}: {
  src: string;
  title: string;
  position: string;
  color?: "bg-fuchsia-500" | "bg-cyan-100";
}) => {
  return (
    <div className="relative w-full h-[350px] md:h-[450px]">
      <ImageSetup src={src} alt={title} variant="cover" position="center 38%" />
      <div className={`absolute bottom-0 left-0 w-full ${color} p-6`}>
        <h3 className="font-bold text-black text-2xl">{title}</h3>
        <p className="text-black text-xl">{position}</p>
      </div>
    </div>
  );
};

export default FounderCard;
