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
    <div className="flex flex-col md:flex-row w-full">
      <div className="  p-4">
        <h2 className="text-lg font-bold mb-4">My reservations:</h2>

        {bookings.length === 0 ? (
          <p>No reservations yet.</p>
        ) : (
          <div className="flex flex-wrap ">
            {bookings.map((booking) => (
              <div key={booking.id} className="w-full md:w-1/2 px-2 mb-4">
                <div className="border-1 rounded p-4 flex flex-row justify-between">
                  <div className="flex flex-col h-full">
                    <span className="font-semibold">{booking.name}</span>
                    <span className="text-sm text-gray-500">
                      {booking.date.toString()}
                    </span>
                    {booking.description && (
                      <span className="text-sm">{booking.description}</span>
                    )}
                  </div>
                  <div>
                    <DeleteReservationButton id={booking.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
