export default function PrivacyPolicyLoading() {
  return (
    <div className="container-max py-12 animate-pulse">
      <div className="h-10 bg-muted rounded w-1/3 mb-6" />
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded w-full" style={{ width: `${[85, 78, 72, 88, 74, 62][i]}%` }} />
        ))}
      </div>
    </div>
  )
}
