import Link from "next/link";
import { HomeIcon, LogInIcon, ShieldIcon } from "lucide-react";
import UserEmail from "./UserEmail";
import { Suspense } from "react";
import NavLink from "./NavLink";

export default function Navigation() {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-56 bg-white border-r border-[#DDD] flex-col py-5 px-4 z-50">
        <div className="flex items-center justify-start mb-8 px-1">
          <Link href="/" className="font-heading italic text-[#111]/80 hover:text-[#111] transition-colors">
            <span className="text-xl">bounce lab</span>
          </Link>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          <NavLink href="/admin" icon={<ShieldIcon size={18} />} label="Admin" />
          <NavLink href="/" icon={<HomeIcon size={18} />} label="View site" />
        </nav>
        <div className="pt-4 border-t border-[#DDD]">
          <Suspense fallback={<NavLink href="/signin" icon={<LogInIcon size={18} />} label="Sign In" />}>
            <UserEmail />
          </Suspense>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#DDD] z-50 flex h-16 safe-area-bottom">
        <Link href="/admin" className="flex-1 flex flex-col items-center justify-center gap-1 text-[#555] hover:text-[#111] active:text-[#111]">
          <ShieldIcon size={20} />
          <span style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>Admin</span>
        </Link>
        <Link href="/" className="flex-1 flex flex-col items-center justify-center gap-1 text-[#555] hover:text-[#111] active:text-[#111]">
          <HomeIcon size={20} />
          <span style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>Site</span>
        </Link>
      </nav>
    </>
  );
}
