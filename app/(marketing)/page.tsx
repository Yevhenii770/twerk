import ImageSetup from "@/components/ui/ImageSetup";
import NewsTicker from "@/components/ui/NewsTicker";
import SectionTitle from "@/components/ui/SectionTitle";
import SectionText from "@/components/ui/SectionText";
import BlockQuote from "@/components/ui/BlockQuote";
import Button from "@/components/ui/Button";
import SectionContainer from "@/components/SectionContainer";
import OverlayTitle from "@/components/OverlayTitle";
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
            <OverlayTitle text="Vision" />
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
            <OverlayTitle text="Classes" />
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
          <div className="flex items-center  h-full p-12">
            <div className="flex flex-col gap-40 md:gap-80">
              <div className="">
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
          <div className="relative h-[350px] md:h-[450px]">
            <ImageSetup
              src="/iryna.jpg"
              alt="Iryna Pytska"
              variant="cover"
              position="center 55%"
            />
            <div className="absolute bottom-0 left-0 w-full bg-fuchsia-500 p-4">
              <h3 className="font-bold">Iryna Pytska</h3>
              <p>Founder & Instructor</p>
            </div>
          </div>

          <div className="relative h-[350px] md:h-[450px]">
            <ImageSetup
              src="/yevhenii.jpg"
              alt="Yevhenii Sitolenko"
              variant="cover"
              position="center 38%"
            />
            <div className="absolute bottom-0 left-0 w-full bg-cyan-100 p-4">
              <h3 className="font-bold text-black">Yevhenii Sitolenko</h3>
              <p className="text-black">Web Developer</p>
            </div>
          </div>
        </div>
      </SectionContainer>

      {/* --- Call To Action Section --- */}
      <div className="w-full bg-blue-600 flex items-center justify-center py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-snug">
            Whether you&apos;re a beginner looking to explore expressive
            movement or an advanced dancer ready to refine your technique, we
            have classes for you!
          </h2>
          <div className="flex justify-center">
            <Link href="/dashboard">
              <Button variant="primary">Reserve your spot</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
