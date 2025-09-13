import {
  ImageSetup,
  SectionTitle,
  SectionText,
  BlockQuote,
  Button,
  SectionContainer,
} from "@/components/ui";
import NewsTicker from "@/components/NewsTicker";
import OverlayTitle from "@/components/OverlayTitle";
import CallToActionSection from "@/components/CallToActionSection";
import FounderCard from "@/components/FounderCard";

import Link from "next/link";

export default function Home() {
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

      {/* --- First Section --- */}
      <SectionContainer>
        <div className="flex flex-col md:flex-row w-full">
          {/* Left column: image */}
          <div className="relative w-full md:w-1/2 h-[60vh] md:h-[80vh]">
            <ImageSetup src="/sample.png" alt="Vision image" variant="cover" />
            <OverlayTitle text="Vision" size="lg" />
          </div>

          {/* Right column: text */}
          <div className="flex w-full md:w-1/2 items-center bg-white p-8 md:p-12">
            <div className="flex flex-col gap-6 w-full">
              <SectionTitle>Who we are</SectionTitle>
              <SectionText>
                At Movement Studio, we&apos;re passionate about creating a
                supportive and inspiring environment for dancers of all levels.
                Whether you&apos;re a complete beginner eager to explore the
                world of modern dance, a seasoned performer looking to refine
                your technique, or simply someone who finds joy in moving,
                you&apos;ll find a home here.
              </SectionText>
              <Link href="/about" className="w-fit">
                <Button
                  type="submit"
                  className="self-start md:w-auto"
                  variant="primary"
                >
                  About Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </SectionContainer>

      {/* --- Second Section --- */}
      <SectionContainer>
        <div className="flex flex-col md:flex-row w-full">
          {/* Left column: image */}
          <div className="relative w-full md:w-1/2 h-[60vh] md:h-[80vh]">
            <ImageSetup
              src="/red_sample.png"
              alt="Classes image"
              variant="cover"
            />
            <OverlayTitle text="Classes" size="lg" />
          </div>

          {/* Right column: text */}
          <div className="flex w-full md:w-1/2 items-center bg-white p-8 md:p-12">
            <div className="flex flex-col gap-6 w-full">
              <SectionTitle>Our Classes</SectionTitle>
              <SectionText>
                Get your groove on with Hip Hop, find your rhythm in Jazz, and
                explore connection in Contact Improvisation. Movement Studio
                offers a diverse range of classes for every dancer.
              </SectionText>
              <Link href="/classes" className="w-fit">
                <Button
                  type="submit"
                  className="self-start md:w-auto"
                  variant="primary"
                >
                  Reserve your spot
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </SectionContainer>

      {/* --- Founders Section --- */}
      <SectionContainer>
        {/* Left column: text */}
        <div className="flex-1 flex flex-col justify-center  bg-white">
          <div className="flex items-center h-full p-12">
            <div className="flex flex-col gap-40 md:gap-80">
              <div>
                <SectionTitle className="text-3xl md:text-4xl font-bold text-black ">
                  Our Founders
                </SectionTitle>
              </div>

              <div>
                <BlockQuote>
                  &quot;Find your flow, and dance your truth.&quot;
                </BlockQuote>
                <SectionText className="text-gray-500">
                  — Sophia Bennett
                </SectionText>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: images */}
        <div className="flex-1 grid grid-rows-2">
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
      </SectionContainer>

      {/* --- Call To Action Section --- */}
      <CallToActionSection />
    </>
  );
}
