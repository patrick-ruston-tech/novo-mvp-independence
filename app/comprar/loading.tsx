export default function ComprarLoading() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex gap-8">
        <aside className="hidden lg:block w-[280px] flex-shrink-0 animate-pulse">
          <div className="space-y-6">
            <div className="h-6 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-100 rounded-xl w-full"></div>
            <div className="h-10 bg-gray-100 rounded-xl w-full"></div>
            <div className="h-20 bg-gray-100 rounded-xl w-full"></div>
            <div className="flex gap-2">
              <div className="h-10 bg-gray-100 rounded-xl flex-1"></div>
              <div className="h-10 bg-gray-100 rounded-xl flex-1"></div>
              <div className="h-10 bg-gray-100 rounded-xl flex-1"></div>
            </div>
          </div>
        </aside>
        <div className="flex-1 animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg w-64 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded w-40 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden">
                <div className="aspect-[4/3] bg-gray-200"></div>
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-100 rounded w-48"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
