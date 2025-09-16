import Link from "next/link";
import { BurgerMenuClient } from "./BurgerMenuClient";
import DashBoardButton from "./DashBoardButton";
import { Suspense } from "react";

export default async function ServerMenu() {
  return (
    <BurgerMenuClient>
      <div className="flex flex-col divide-y divide-gray-700">
        <Link href="/classes" className="p-4 hover:bg-blue-600">
          Classes
        </Link>

        <Link href="/about" className="p-4 hover:bg-blue-600">
          About
        </Link>

        <Link href="/faq" className="p-4 hover:bg-blue-600">
          FAQ
        </Link>

        <Suspense fallback={<div className="p-4">...</div>}>
          <DashBoardButton />
        </Suspense>
      </div>
    </BurgerMenuClient>
  );
}
