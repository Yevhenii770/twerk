import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import NewReservation from "@/components/NewReservation";

export default async function NewReservationPage() {
  return (
    <div className="h-dvh">
      <div className="max-w-3xl mx-auto p-4 s md:p-8 ">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
        >
          <ArrowLeftIcon size={16} className="mr-1" />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold mb-6">Create New Reservation</h1>

        <div className="">
          <Suspense fallback={<div>Loading...</div>}>
            <NewReservation />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
