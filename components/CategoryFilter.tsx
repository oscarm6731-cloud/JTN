import Link from 'next/link'

const CATEGORIES: { label: string; slug: string }[] = [
  { label: 'All', slug: 'all' },
  { label: 'Politics', slug: 'politics' },
  { label: 'World', slug: 'world' },
  { label: 'Business', slug: 'business' },
  { label: 'Tech', slug: 'tech' },
  { label: 'Sports', slug: 'sports' },
  { label: 'Entertainment', slug: 'entertainment' },
]

interface CategoryFilterProps {
  active?: string
}

export default function CategoryFilter({ active = 'all' }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => {
        const isActive = cat.slug === active
        const href = cat.slug === 'all' ? '/' : `/category/${cat.slug}`
        return (
          <Link
            key={cat.slug}
            href={href}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              isActive
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </Link>
        )
      })}
    </div>
  )
}
