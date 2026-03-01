function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
      <div className="h-8 w-32 rounded bg-gray-200 animate-pulse mt-3" />
    </div>
  )
}

function PurchaseCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="h-5 w-36 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" />
      </div>

      <div className="space-y-2">
        <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
        <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
        <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
      </div>

      <div className="h-9 w-24 rounded bg-gray-200 animate-pulse" />
    </div>
  )
}

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-9 w-44 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-72 rounded bg-gray-200 animate-pulse mt-2" />
        </div>
        <div className="h-11 w-36 rounded-xl bg-gray-200 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="h-7 w-52 rounded bg-gray-200 animate-pulse" />
        </div>

        <div className="grid gap-4 p-4 md:hidden">
          <PurchaseCardSkeleton />
          <PurchaseCardSkeleton />
          <PurchaseCardSkeleton />
        </div>

        <div className="hidden md:block p-6 space-y-4">
          <div className="h-10 w-full rounded bg-gray-200 animate-pulse" />
          <div className="h-14 w-full rounded bg-gray-100 animate-pulse" />
          <div className="h-14 w-full rounded bg-gray-100 animate-pulse" />
          <div className="h-14 w-full rounded bg-gray-100 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
