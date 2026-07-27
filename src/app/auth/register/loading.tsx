export default function RegisterLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-muted border-t-accent rounded-full animate-spin" />
        <div className="h-4 bg-muted rounded w-24 animate-pulse" />
      </div>
    </div>
  )
}
