"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export const BurgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-5 md:p-6 focus:outline-none"
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black text-white flex flex-col divide-y divide-gray-700 z-50">
          <Link
            href="/classes"
            className="p-4 hover:bg-blue-600"
            onClick={() => setIsOpen(false)}
          >
            Classes
          </Link>
          <Link
            href="/about"
            className="p-4 hover:bg-blue-600"
            onClick={() => setIsOpen(false)}
          >
            About
          </Link>
          <Link
            href="/faq"
            className="p-4 hover:bg-blue-600"
            onClick={() => setIsOpen(false)}
          >
            FAQ
          </Link>
          <Link
            href="/signin"
            className="p-4 hover:bg-blue-600"
            onClick={() => setIsOpen(false)}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="p-4 hover:bg-blue-600"
            onClick={() => setIsOpen(false)}
          >
            Sign up
          </Link>
        </div>
      )}
    </>
  );
};
