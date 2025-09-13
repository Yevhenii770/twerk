import Link from "next/link";
import { Button } from "./ui";

const CallToActionSection = () => {
  return (
    <div className="w-full bg-blue-600 flex items-center justify-center py-24 px-6 text-center">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white leading-snug">
          Whether you&apos;re a beginner looking to explore expressive movement
          or an advanced dancer ready to refine your technique, we have classes
          for you!
        </h2>
        <div className="flex justify-center">
          <Link href="/dashboard">
            <Button variant="primary">Reserve your spot</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CallToActionSection;
