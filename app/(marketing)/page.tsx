import SectionContainer from "@/components/SectionContainer";
import ImageSetup from "@/components/ui/ImageSetup";
import NewsTicker from "@/components/ui/NewsTicker";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <NewsTicker
        items={[
          "New Contemporary Dance Classes Now Enrolling - Secure Your Spot",
          "Fluid. Expressive. Powerful. Move with us!",
          "Masterclass Alert: Guest Choreographer Workshop This Saturday",
        ]}
        durationSec={18}
      />
      <SectionContainer>
        <div className="flex flex-col md:flex-row w-full">
          <div className="relative w-full md:w-1/2 h-[60vh] md:h-[80vh] overflow-hidden">
            <ImageSetup src="/sample.png" alt="Vision image" variant="cover" />
          </div>

          <div className="flex w-full md:w-1/2 items-center bg-white p-8 md:p-12">
            <div className="flex flex-col gap-6 w-full">
              <h3 className="text-black text-2xl font-bold">Who we are</h3>
              <p className="text-black">
                At Movement Studio, we’re passionate about creating a supportive
                and inspiring environment for dancers of all levels. Whether
                you’re a complete beginner eager to explore the world of modern
                dance, a seasoned performer looking to refine your technique, or
                simply someone who finds joy in moving, you’ll find a home here.
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
      <SectionContainer>
        <div className="flex flex-col md:flex-row w-full">
          <div className="relative w-full md:w-1/2 h-[60vh] md:h-[80vh] overflow-hidden">
            <ImageSetup src="/sample.png" alt="Classes image" variant="cover" />
          </div>

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
      <SectionContainer>
        <div className="flex-1 p-8 md:p-12">
          <h2 className="text-2xl font-bold mb-6">Our Founders</h2>
          <p className="text-lg mb-4">
            "Find your flow, and dance your truth."
          </p>
          <p className="text-gray-400">— Sophia Bennett</p>
        </div>

        <div className="flex-1 grid grid-rows-2">
          <div className="relative h-[250px] md:h-[350px]">
            <ImageSetup src="/iryna.jpg" alt="Classes image" />
            <div className="absolute bottom-0 left-0 w-full bg-fuchsia-500 p-4">
              <h3 className="font-bold">Iryna Pytska</h3>
              <p>Founder & Instructor</p>
            </div>
          </div>

          <div className="relative h-[250px] md:h-[350px]">
            <ImageSetup src="/yevhenii.jpg" alt="Classes image" />
            <div className="absolute bottom-0 left-0 w-full bg-cyan-100 p-4">
              <h3 className="font-bold text-black">Yevhenii Sitolenko</h3>
              <p className="text-black">Web developer</p>
            </div>
          </div>
        </div>
      </SectionContainer>
    </>
  );
}
