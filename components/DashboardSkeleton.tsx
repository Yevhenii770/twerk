export default function ReservationsSkeleton() {
  return (
    <div className="animate-pulse">
      <h2 className="text-xl font-bold mb-4">My reservations:</h2>

      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <div className="h-5 w-40 bg-gray-300 dark:bg-gray-600 rounded mb-2" />

            <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded mb-2" />

            <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-600 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
