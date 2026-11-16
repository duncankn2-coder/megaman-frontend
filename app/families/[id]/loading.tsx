export default function FamilyLoading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-8">
        <div className="h-4 w-48 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="aspect-[4/3] bg-gray-100 rounded border border-gray-200" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 bg-gray-200 rounded" />
            <div className="h-4 w-full bg-gray-100 rounded" />
            <div className="h-4 w-5/6 bg-gray-100 rounded" />
            <div className="h-4 w-4/6 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="h-64 w-full bg-gray-100 rounded border border-gray-200" />
      </div>
    </div>
  );
}
