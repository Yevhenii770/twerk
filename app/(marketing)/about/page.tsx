import CallToActionSection from "@/components/CallToActionSection";
import { ImageSetup } from "@/components/ui";
import OverlayTitle from "@/components/OverlayTitle";
import { SectionContainer } from "@/components/ui";
import FounderCard from "@/components/FounderCard";
import NewsTicker from "@/components/NewsTicker";

export default function About() {
  return (
    <>
      {/* --- News Ticker --- */}
      <NewsTicker
        items={[
          "New Contemporary Dance Classes Now Enrolling - Secure Your Spot",
          "Fluid. Expressive. Powerful. Move with us!",
          "Masterclass Alert: Guest Choreographer Workshop This Saturday",
        ]}
        durationSec={18}
      />
      <SectionContainer>
        <div className="relative w-full h-[20vh] sm:h-[20vh] md:w-5/11 bg-black md:h-full">
          <OverlayTitle text="Founders" />
        </div>
        <div className=" w-full flex md:w-6/11">
          <div className="flex-1 grid grid-rows-2 md:flex">
            <FounderCard
              src="/iryna.jpg"
              title="Iryna Pytska"
              position="Founder & Instructor"
              color="bg-fuchsia-500"
            />

            <FounderCard
              src="/yevhenii.jpg"
              title="Yevhenii Sitolenko"
              position="Web Developer"
              color="bg-cyan-100"
            />
          </div>
        </div>
      </SectionContainer>

      <SectionContainer>
        <div className=" w-full relative flex items-center justify-center h-[30vh] md:h-[50vh] md:w-8/11">
          <ImageSetup src="/studio.jpg" alt="Our Promise" priority />
        </div>
        <div className="p-5 pl-12 pr-12 bg-black md:w-3/11">
          <h2 className="text-2xl pb-4 text-white">Our Space</h2>
          <p className="text-white">
            Whether you're a beginner looking to explore expressive movement or
            an advanced dancer ready to refine your technique, we have classes
            for you! Join our weekly sessions, drop in for open-level classes,
            or take part in our upcoming choreography series. Don’t miss our
            special Masterclass with Maxime Longue this Saturday! Limited spots
            available
          </p>
        </div>
      </SectionContainer>
      <CallToActionSection />
    </>
  );
}
