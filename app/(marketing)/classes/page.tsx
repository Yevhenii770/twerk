import {
  ImageSetup,
  SectionTitle,
  SectionText,
  BlockQuote,
  Button,
  SectionContainer,
} from "@/components/ui";
import OverlayTitle from "@/components/OverlayTitle";

import ClassCard from "@/components/ClassCard";

export default function Classes() {
  return (
    <>
      <SectionContainer>
        <div className="flex-wrap gap-6 md:w-2/5">
          <div className="relative w-full md:w-1/2 h-[30vh] md:h-[70vh]">
            <OverlayTitle
              text="Booking Experience for Classes
"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 md:w-3/5">
          <ClassCard
            id="C1"
            title="Hip Hop Foundations"
            description="This class introduces hip hop dance, including isolations, popping, locking, and basic footwork."
            time="Tuesdays 7:00 PM - 9:00 PM"
            imageUrl="/red_sample.png"
            bookingUrl="/booking/hiphop-foundations"
          />
          <ClassCard
            id="C2"
            title="Hip Hop Freestyle"
            description="This class helps you develop your own unique movement vocabulary and respond to music in the moment."
            time="Wednesdays 6:00 PM - 8:00 PM"
            imageUrl="/red_sample.png"
            bookingUrl="/booking/hiphop-freestyle"
          />
          <ClassCard
            id="C3"
            title="Breaking Basics"
            description="Learn top rock, down rock, and freeze basics in this introduction to breaking."
            time="Fridays 5:00 PM - 7:00 PM"
            imageUrl="/red_sample.png"
            bookingUrl="/booking/breaking"
          />
        </div>
      </SectionContainer>

      <SectionContainer>
        <div className="flex-wrap gap-6 md:w-2/5">
          <div className="relative md:w-1/5 h-[30vh] md:h-[50vh]">
            <OverlayTitle text="Our Promise" />
          </div>
        </div>

        <div className="md:w-3/5">
          <div className=" bg-blue-600">
            <p className=" text-white sm:text-2xl md:text-3xl font-bold p-7">
              Whether you're a beginner looking to explore expressive movement
              or an advanced dancer ready to refine your technique, we have
              classes for you!
            </p>
          </div>
          <div className="relative flex items-center justify-center w-full h-[60vh] overflow-hidden">
            <ImageSetup
              src="/red_sample.png"
              alt="Our Promise"
              variant="cover"
              className="z-0"
            />
          </div>
        </div>
      </SectionContainer>
    </>
  );
}
