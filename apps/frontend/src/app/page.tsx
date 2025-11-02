export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to Frontend App</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A modern web application built with Next.js 14, TypeScript, Tailwind CSS, and Shadcn UI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Library</h3>
          <p className="text-muted-foreground mb-4">
            Browse and manage your content library.
          </p>
          <a
            href="/library"
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            Go to Library →
          </a>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Upload</h3>
          <p className="text-muted-foreground mb-4">
            Upload new content to your library.
          </p>
          <a
            href="/upload"
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            Upload Content →
          </a>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Settings</h3>
          <p className="text-muted-foreground mb-4">
            Configure your application preferences.
          </p>
          <a
            href="/settings"
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            Manage Settings →
          </a>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Features</h3>
          <p className="text-muted-foreground mb-4">
            Built with modern tools and best practices.
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Next.js 14 App Router</li>
            <li>• TypeScript</li>
            <li>• Tailwind CSS</li>
            <li>• Shadcn UI</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
