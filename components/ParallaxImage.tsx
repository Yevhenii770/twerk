"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export default function ParallaxImage() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 100%", "150% end"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["20px", "100px"]);

  return (
    <div ref={ref} className="relative w-[200px] h-[200px] overflow-hidden">
      <motion.div style={{ y }} className="w-full h-full">
        <Image
          src="/red_sample.png"
          alt="Parallax example"
          fill
          className="object-cover"
        />
      </motion.div>
    </div>
  );
}
