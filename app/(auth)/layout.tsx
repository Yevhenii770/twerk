import Link from "next/link";
import Button from "@/components/ui/Button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="md:hidden flex justify-end">
        <Link href="/">
          <Button variant="ghost">Home page</Button>
        </Link>
      </div>
      <div>{children}</div>
    </>
  );
}
