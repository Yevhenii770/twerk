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

      <footer className="border-t border-gray-200 dark:border-dark-border-subtle bg-dark dark:bg-dark-base">
        <div className="container mx-auto px-4 py-8"></div>
      </footer>
    </>
  );
}
