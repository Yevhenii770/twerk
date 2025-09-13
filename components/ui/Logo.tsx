import Link from "next/link";

export const Logo = () => {
  return (
    <div className="p-5 md:p-6">
      <Link href="/" className="text-xl font-bold">
        Bounce lab.
      </Link>
    </div>
  );
};
