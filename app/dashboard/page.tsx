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
    <div className="flex flex-col md:flex-row w-full md:justify-center">
      <div className="  p-4">
        <h2 className="text-lg font-bold mb-4 md:mx-2">My reservations:</h2>

        {bookings.length === 0 ? (
          <p>No reservations yet.</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="w-full md:w-[calc(50%-0.5rem)]   "
              >
                <div className="border rounded p-4 flex flex-row justify-between h-full">
                  <div className="flex flex-col">
                    <span className="font-semibold">{booking.name}</span>
                    <span className="text-sm text-gray-500">
                      {booking.date.toString()}
                    </span>
                    {booking.description && (
                      <span className="text-sm">{booking.description}</span>
                    )}
                  </div>
                  <DeleteReservationButton id={booking.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
