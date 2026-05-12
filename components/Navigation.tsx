import Link from "next/link";
import { LayoutDashboardIcon, HomeIcon, LogInIcon } from "lucide-react";
import UserEmail from "./UserEmail";
import { Suspense } from "react";
import NavLink from "./NavLink";

export default function Navigation() {
  return (
    <aside className="fixed inset-y-0 left-0 w-16 md:w-56 bg-white border-r border-[#DDD] flex flex-col py-5 px-2 md:px-4 z-50">
      <div className="flex items-center justify-center md:justify-start mb-8 px-1">
        <Link href="/" className="font-heading italic text-[#111]/80 hover:text-[#111] transition-colors">
          <span className="hidden md:inline text-xl">bounce lab</span>
          <span className="md:hidden text-lg">b</span>
        </Link>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        <NavLink
          href="/dashboard"
          icon={<LayoutDashboardIcon size={18} />}
          label="Bookings"
        />
        <NavLink
          href="/"
          icon={<HomeIcon size={18} />}
          label="View site"
        />
      </nav>

      <div className="pt-4 border-t border-[#DDD]">
        <Suspense fallback={
          <NavLink href="/signin" icon={<LogInIcon size={18} />} label="Sign In" />
        }>
          <UserEmail />
        </Suspense>
      </div>
    </aside>
  );
}
