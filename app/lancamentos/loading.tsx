export default function LancamentosLoading() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-72 mb-2"></div>
      <div className="h-4 bg-gray-100 rounded w-96 mb-10"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden">
            <div className="aspect-[16/10] bg-gray-200"></div>
            <div className="p-5 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-100 rounded w-32"></div>
              <div className="h-8 bg-gray-200 rounded w-36 mt-2"></div>
              <div className="h-2 bg-gray-100 rounded-full w-full mt-4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
