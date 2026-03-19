export default function Loading() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-64 mb-4"></div>
      <div className="h-4 bg-gray-100 rounded w-40 mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden">
            <div className="aspect-[4/3] bg-gray-200"></div>
            <div className="p-5 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-100 rounded w-48"></div>
              <div className="h-3 bg-gray-100 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
