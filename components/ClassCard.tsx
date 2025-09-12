import Image from "next/image";
import Link from "next/link";

interface ClassCardProps {
  id: string;
  title: string;
  description: string;
  time: string;
  imageUrl: string;
  bookingUrl?: string;
  isUnavailable?: boolean;
}

export default function ClassCard({
  id,
  title,
  description,
  time,
  imageUrl,
  bookingUrl = "#",
  isUnavailable = false,
}: ClassCardProps) {
  return (
    <div
      className={`flex flex-col divide-x divide-y divide-gray-200 ${
        isUnavailable ? "card-disabled" : "card-active"
      }`}
    >
      {/* Image + ID */}
      <div className="relative">
        <Image
          src={imageUrl}
          alt={title}
          width={400}
          height={250}
          className="w-full h-64 object-cover"
        />
        <span className="absolute top-2 left-2 text-5xl font-bold text-white drop-shadow-lg">
          {id}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1 ">
        <h3 className="text-xl font-semibold text-black">{title}</h3>
        <p className="text-gray-600 text-sm flex-1">{description}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t px-4 py-2 ">
        <span className="text-blue-600 font-medium">{time}</span>
        {isUnavailable ? (
          <button className="px-4 py-2 bg-gray-400 text-gray-200 rounded cursor-not-allowed">
            Unavaible
          </button>
        ) : (
          <Link
            href={bookingUrl}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
          >
            Book Now
          </Link>
        )}
      </div>
    </div>
  );
}
