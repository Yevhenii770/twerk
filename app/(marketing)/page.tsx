import SectionContainer from "@/components/SectionContainer";
import ImageSetup from "@/components/ui/Image";
import NewsTicker from "@/components/ui/NewsTicker";
import Button from "@/components/ui/Button";
export default function Home() {
  return (
    <div className="">
      <NewsTicker
        items={[
          "New Contemporary Dance Classes Now Enrolling - Secure Your Spot",
          "Fluid. Expressive. Powerful. Move with us!",
          "Masterclass Alert: Guest Choreographer Workshop This Saturday",
        ]}
        durationSec={18}
      />
      <SectionContainer>
        <div className="relative flex-1 h-[60vh] md:h-[80vh] overflow-hidden">
          {/* <h2 className="text-white z-1">Vision</h2> */}
          <ImageSetup src="/sample.png" alt="alt test text" />
        </div>
        <div className="flex-1 flex items-center justify-center  bg-white p-[48px]">
          <div className="flex flex-col flex-start gap-[35px]">
            <h3 className="text-black">Who we are</h3>
            <p className="text-black">
              At Movement Studio, we’re passionate about creating a supportive
              and inspiring environment for dancers of all levels. Whether
              you’re a complete beginner eager to explore the world of modern
              dance, a seasoned performer looking to refine your technique, or
              simply someone who finds joy in moving, you’ll find a home here.
            </p>

            <Button type="submit" className="w-full" variant="primary">
              About Us
            </Button>
          </div>
        </div>
      </SectionContainer>
      <section>section2</section>
    </div>
  );
}
