import { getReservations, getCurrentUser } from "@/lib/dal";
import { redirect } from "next/navigation";
import { DeleteReservationButton } from "@/components/DeleteReservationButton";
import { getNextFridayFormatted } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  const bookings = await getReservations(user.id);

  return (
    <>
      <div className="flex flex-col mb-6">
        <span className="text-xl font-bold">Next lesson will be:</span>
        <div className="mb-2">
          <span className="text-green-500">{getNextFridayFormatted()}</span>
          <span>{" at 6:00 pm"}</span>
        </div>
        <div className="md:w-1/2">
          <p className="text-black dark:text-white">
            Here you’ll see your reservations. You can only book one spot per
            training. Once reserved, just come and enjoy your class at the
            scheduled time!
          </p>
        </div>
      </div>
      <h2 className="text-lg font-bold mb-4">My reservations:</h2>

      {bookings.length === 0 ? (
        <p>No reservations yet.</p>
      ) : (
        <div className="flex flex-col gap-4 ">
          {bookings.map((booking) => (
            <div key={booking.id} className="w-full md:w-1/2 lg:w-1/3">
              <div className=" border-gray-50 dark:bg-white rounded p-4 flex flex-row justify-between gap-4 shadow-md">
                <div className="flex flex-col">
                  <span className="font-semibold break-anywhere dark:text-black">
                    {booking.name}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-black">
                    {booking.date.toString()}
                  </span>
                  {booking.description && (
                    <span className="text-sm break-words break-anywhere dark:text-black">
                      {booking.description}
                    </span>
                  )}
                </div>
                <DeleteReservationButton id={booking.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
