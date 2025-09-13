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
        <div className="flex-wrap gap-6 md:w-6/11">
          <div className="relative w-[40vh] md:w-[90vh] h-[15vh]">
            <OverlayTitle text="Booking Experience for Classes" size="sm" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 md:w-5/11">
          <ClassCard
            id="A1"
            title="Twerk Choreo"
            description="This class introduces hip hop dance, including isolations, popping, locking, and basic footwork."
            time="Tuesdays 7:00 PM - 9:00 PM"
            imageUrl="/red_sample.png"
            bookingUrl="/dashboard"
          />
          <ClassCard
            id="B1"
            title="Twerk Choreo (Advanced)"
            description="This class helps you develop your own unique movement vocabulary and respond to music in the moment."
            time="Wednesdays 6:00 PM - 8:00 PM"
            imageUrl="/red_sample.png"
            bookingUrl="/dashboard"
          />
          <ClassCard
            id="C3"
            title="Breaking Basics"
            description="Learn top rock, down rock, and freeze basics in this introduction to breaking."
            time="Fridays 5:00 PM - 7:00 PM"
            imageUrl="/red_sample.png"
            bookingUrl="/dashboard"
            isUnavailable={true}
          />
          <ClassCard
            id="C1"
            title="Hip Hop Foundations"
            description="This class introduces hip hop dance, including isolations, popping, locking, and basic footwork."
            time="Tuesdays 7:00 PM - 9:00 PM"
            imageUrl="/red_sample.png"
            bookingUrl="/dashboard"
            isUnavailable={true}
          />
        </div>
      </SectionContainer>

      <SectionContainer>
        <div className="flex-wrap gap-6 md:w-6/11">
          <div className="relative w-[40vh] md:w-[90vh] h-[15vh]">
            <OverlayTitle text="Our Promise" size="sm" />
          </div>
        </div>

        <div className="md:w-5/11">
          <div className=" bg-blue-600 ">
            <div className="w-fll md:w-[80vh]">
              <p className=" text-white text-3xl md:text-4xl font-bold p-7">
                Whether you're a beginner looking to explore expressive movement
                or an advanced dancer ready to refine your technique, we have
                classes for you!
              </p>
            </div>
          </div>
          <div className="relative flex items-center justify-center h-[40vh] md:h-[60vh] overflow-hidden">
            <ImageSetup
              src="/promise.jpg"
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
