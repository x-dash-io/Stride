export default function AccessibilityLoading() {
  return (
    <div className="container-max py-12 animate-pulse">
      <div className="h-10 bg-muted rounded w-1/3 mb-6" />
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded w-full" style={{ width: `${[84, 78, 72, 89, 76, 64][i]}%` }} />
        ))}
      </div>
    </div>
  )
}
