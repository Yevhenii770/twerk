"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export const BurgerMenuClient = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className=" md:hidden ">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 focus:outline-none"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>
      {isOpen && (
        <div
          className="absolute top-full left-0 bg-black text-white z-50 w-full"
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};
