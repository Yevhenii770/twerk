import { getReservations, getCurrentUser } from "@/lib/dal";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  const bookings = await getReservations(user.id);

  return (
    <div className="flex flex-col md:flex-row w-full">
      <div className="md:basis-[70%] border-1 p-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold mb-2">My reservations:</h2>

          {bookings.length === 0 ? (
            <p>No reservations yet.</p>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="border rounded p-2 flex flex-col"
              >
                <span className="font-semibold">{booking.name}</span>
                <span className="text-sm text-gray-500">
                  {booking.date.toString()}
                </span>
                {booking.description && (
                  <span className="text-sm">{booking.description}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
