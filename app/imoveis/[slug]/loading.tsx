export default function PropertyLoading() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-48 mb-4"></div>
      <div className="h-[420px] bg-gray-200 rounded-2xl mb-8"></div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          <div className="h-8 bg-gray-200 rounded w-96"></div>
          <div className="h-4 bg-gray-100 rounded w-64"></div>
          <div className="h-12 bg-gray-200 rounded w-48"></div>
          <div className="bg-gray-100 rounded-2xl h-24"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-100 rounded w-full"></div>
            <div className="h-4 bg-gray-100 rounded w-full"></div>
            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="bg-gray-200 rounded-2xl h-96"></div>
        </div>
      </div>
    </div>
  );
}
