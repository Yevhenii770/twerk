import SectionContainer from "@/components/SectionContainer";
import ImageSetup from "@/components/ui/ImageSetup";
import NewsTicker from "@/components/ui/NewsTicker";
import Button from "@/components/ui/Button";
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
          </div>

          {/* Right column: text */}
          <div className="flex w-full md:w-1/2 items-center bg-white p-8 md:p-12">
            <div className="flex flex-col gap-6 w-full">
              <h3 className="text-black text-2xl font-bold">Who we are</h3>
              <p className="text-black">
                At Movement Studio, we&apos;re passionate about creating a
                supportive and inspiring environment for dancers of all levels.
                Whether you&apos;re a complete beginner eager to explore the
                world of modern dance, a seasoned performer looking to refine
                your technique, or simply someone who finds joy in moving,
                you&apos;ll find a home here.
              </p>
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
            <ImageSetup src="/sample.png" alt="Classes image" variant="cover" />
          </div>

          {/* Right column: text */}
          <div className="flex w-full md:w-1/2 items-center bg-white p-8 md:p-12">
            <div className="flex flex-col gap-6 w-full">
              <h3 className="text-black text-2xl font-bold">Our Classes</h3>
              <p className="text-black">
                Get your groove on with Hip Hop, find your rhythm in Jazz, and
                explore connection in Contact Improvisation. Movement Studio
                offers a diverse range of classes for every dancer.
              </p>
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
        <div className="flex-1 flex flex-col justify-center p-8 md:p-12 bg-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-black">
            Our Founders
          </h2>

          <blockquote className="border-l-4 border-gray-300 pl-6 italic text-xl md:text-2xl leading-relaxed text-gray-800">
            &quot;Find your flow, and dance your truth.&quot;
          </blockquote>

          <p className="mt-6 text-gray-500">— Sophia Bennett</p>
        </div>

        {/* Right column: images */}
        <div className="flex-1 grid grid-rows-2">
          <div className="relative h-[250px] md:h-[350px]">
            <ImageSetup src="/iryna.jpg" alt="Iryna Pytska" variant="cover" />
            <div className="absolute bottom-0 left-0 w-full bg-fuchsia-500 p-4">
              <h3 className="font-bold">Iryna Pytska</h3>
              <p>Founder & Instructor</p>
            </div>
          </div>

          <div className="relative h-[250px] md:h-[350px]">
            <ImageSetup
              src="/yevhenii.jpg"
              alt="Yevhenii Sitolenko"
              variant="cover"
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
            <Button variant="primary">Reserve your spot</Button>
          </div>
        </div>
      </div>
    </>
  );
}
