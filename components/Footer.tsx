import Link from 'next/link'

const CATEGORIES = [
  { label: 'Politics', slug: 'politics' },
  { label: 'World', slug: 'world' },
  { label: 'Business', slug: 'business' },
  { label: 'Tech', slug: 'tech' },
  { label: 'Sports', slug: 'sports' },
  { label: 'Entertainment', slug: 'entertainment' },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <span className="text-white text-2xl font-extrabold tracking-tight">JTN</span>
            <p className="mt-2 text-sm leading-relaxed">
              Just The News — neutral, AI-powered news aggregation from the world's top sources.
              Delivered daily, fact-first.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Categories</h3>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/category/${cat.slug}`} className="text-sm hover:text-white transition">
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">More</h3>
            <ul className="space-y-2">
              <li><Link href="/daily-digest" className="text-sm hover:text-white transition">Daily Digest</Link></li>
              <li><Link href="/#subscribe" className="text-sm hover:text-white transition">Subscribe</Link></li>
              <li><Link href="/unsubscribe" className="text-sm hover:text-white transition">Unsubscribe</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} JTN. News summaries are AI-generated for informational purposes.
          </p>
          <p className="text-xs">
            Sources: NewsAPI &bull; The Guardian &bull; New York Times
          </p>
        </div>
      </div>
    </footer>
  )
}
