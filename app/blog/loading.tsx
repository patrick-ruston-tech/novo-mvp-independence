export default function BlogLoading() {
  return (
    <div className="w-full animate-pulse">
      <div className="px-4 sm:px-6 lg:px-[200px] pt-8">
        <div className="h-[480px] bg-gray-200 rounded-3xl"></div>
      </div>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-2 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-full w-24"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[4/3] bg-gray-200 rounded-2xl mb-4"></div>
              <div className="h-3 bg-gray-100 rounded w-24 mb-2"></div>
              <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
