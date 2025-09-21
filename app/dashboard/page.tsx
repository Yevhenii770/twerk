import { getReservations, getCurrentUser } from "@/lib/dal";
import { redirect } from "next/navigation";
import { DeleteReservationButton } from "@/components/DeleteReservationButton";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  const bookings = await getReservations(user.id);

  return (
    <>
      <h2 className="text-lg font-bold mb-4">My reservations:</h2>

      {bookings.length === 0 ? (
        <p>No reservations yet.</p>
      ) : (
        <div className="flex flex-col gap-4 ">
          {bookings.map((booking) => (
            <div key={booking.id} className="w-full md:w-1/2 lg:w-1/3">
              <div className="border rounded p-4 flex flex-row justify-between gap-4 shadow-md">
                <div className="flex flex-col">
                  <span className="font-semibold break-anywhere">
                    {booking.name}
                  </span>
                  <span className="text-sm text-gray-500 ">
                    {booking.date.toString()}
                  </span>
                  {booking.description && (
                    <span className="text-sm break-words break-anywhere">
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
