import { getAllUsers, getCurrentUser } from "@/lib/dal";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "admin") {
    redirect("/");
  }

  const users = await getAllUsers();

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full border border-gray-300 dark:border-gray-600">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="border px-4 py-2 text-left">Email</th>
                  <th className="border px-4 py-2 text-left">Role</th>
                  <th className="border px-4 py-2 text-left">Created At</th>
                  <th className="border px-4 py-2 text-left">Reservations</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="border px-4 py-2">{user.email}</td>
                    <td className="border px-4 py-2 capitalize">{user.role}</td>
                    <td className="border px-4 py-2">
                      {new Date(user.createdAt).toLocaleString()}
                    </td>
                    <td className="border px-4 py-2">
                      {user.bookings?.length > 0 ? (
                        <ul className="list-disc pl-5">
                          {user.bookings.map((booking) => (
                            <li key={booking.id}>
                              {new Date(booking.date).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}{" "}
                              —{" "}
                              <span className="font-medium">
                                {booking.name}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "No reservations"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="block md:hidden space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="border rounded-lg p-4 shadow-sm bg-white dark:bg-gray-900"
              >
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold">{user.email}</p>

                <p className="text-sm text-gray-500 mt-2">Role</p>
                <p className="capitalize">{user.role}</p>

                <p className="text-sm text-gray-500 mt-2">Created At</p>
                <p>{new Date(user.createdAt).toLocaleString()}</p>

                <p className="text-sm text-gray-500 mt-2">Reservations</p>
                {user.bookings?.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {user.bookings.map((booking) => (
                      <li key={booking.id}>
                        {new Date(booking.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        — <span className="font-medium">{booking.name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No reservations</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
