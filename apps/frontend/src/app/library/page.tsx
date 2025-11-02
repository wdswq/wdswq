export default function LibraryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Library</h1>
        <p className="text-muted-foreground">
          Browse and manage your content library.
        </p>
      </div>

      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Your Content</h2>
        <div className="text-center py-12 text-muted-foreground">
          <p>No content yet. Upload some files to get started!</p>
          <a
            href="/upload"
            className="inline-block mt-4 text-primary hover:underline"
          >
            Go to Upload →
          </a>
        </div>
      </div>
    </div>
  )
}