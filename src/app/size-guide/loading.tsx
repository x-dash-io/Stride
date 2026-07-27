export default function SizeGuideLoading() {
  return (
    <div className="container-max py-12 animate-pulse">
      <div className="h-10 bg-muted rounded w-1/3 mb-6" />
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded w-full" style={{ width: `${[87, 72, 77, 84, 70, 63][i]}%` }} />
        ))}
      </div>
      <div className="h-64 bg-muted rounded mt-8" />
    </div>
  )
}
