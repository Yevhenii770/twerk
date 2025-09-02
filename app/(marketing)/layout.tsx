import Link from "next/link";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b border-gray-200 dark:border-dark-border-subtle bg-dark dark:bg-dark-base   w-full ">
        <div className="flex items-center justify-between divide-x-1 divide-gray-600">
          <div className="p-6  mr-auto ">
            <Link href="/" className="text-xl font-bold ">
              Bounce lab.
            </Link>
          </div>
          <nav className="hidden md:flex ">
            <ul className="flex divide-x-1 divide-gray-600">
              <li className="p-6 hover:bg-blue-600 transition-colors duration-300 border-l border-gray-600">
                <Link href="/classes" className="text-sm   font-medium ">
                  Classes
                </Link>
              </li>
              <li className="p-6 hover:bg-blue-600 transition-colors duration-300">
                {" "}
                <Link href="/about" className="text-sm   font-medium ">
                  About
                </Link>
              </li>
              <li className="p-6 hover:bg-blue-600 transition-colors duration-300 ">
                {" "}
                <Link href="/faq" className="text-sm   font-medium ">
                  FAQ
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="w-full">
        <div className="flex flex-col md:flex-row bg-cyan-100 text-black p-12">
          <div className="flex-1">
            <h2 className="text-6xl font-extrabold leading-none">
              Bounce
              <br />
              Lab
            </h2>
          </div>

          <div className="flex-1 grid md:grid-cols-2 gap-8 text-sm mt-8 md:mt-0">
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-semibold">Email:</p>
                <a href="mailto:hello@figma.com" className="hover:underline">
                  hello@figma.com
                </a>
              </div>
              <div>
                <p className="font-semibold">Instagram:</p>
                <a
                  href="https://instagram.com/figma"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  @figma
                </a>
              </div>
              <div>
                <p className="font-semibold">Facebook:</p>
                <a
                  href="https://facebook.com/figma"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  figma
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <p className="font-semibold">Address:</p>
                <a
                  href="https://maps.google.com/?q=224 Candyland Lane, Brooklyn, NY"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  224 Candyland Lane, Brooklyn, NY
                </a>
              </div>
              <div>
                <p className="font-semibold">Phone:</p>
                <a href="tel:+16465554567" className="hover:underline">
                  (646) 555-4567
                </a>
              </div>
              <p className="text-sm mt-6">
                Movement Studios© <br /> 2025 All Rights Reserved
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 text-white font-semibold text-lg">
          <a href="#" className="bg-blue-600 p-8 hover:opacity-90 transition">
            Our Socials
          </a>
          <a
            href="mailto:hello@figma.com"
            className="bg-black p-8 hover:opacity-90 transition"
          >
            Email us
          </a>
          <a
            href="#"
            className="bg-fuchsia-500 p-8 hover:opacity-90 transition"
          >
            Book with us
          </a>
        </div>
      </footer>
    </>
  );
}
