import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"

const PageSkeleton = () => {
  return (
    <div className="p-6 space-y-4">

      <Skeleton height={40} width={200} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton height={120} />
        <Skeleton height={120} />
        <Skeleton height={120} />
      </div>

      <Skeleton height={50} />

      <Skeleton height={200} />

    </div>
  )
}

export default PageSkeleton