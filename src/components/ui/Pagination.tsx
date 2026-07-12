import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  totalPages: number
  totalElements: number
  size: number
  onPage: (p: number) => void
}

export const Pagination = ({ page, totalPages, totalElements, size, onPage }: Props) => {
  if (totalPages <= 1) return null
  const from = page * size + 1
  const to = Math.min((page + 1) * size, totalElements)

  return (
    <div className="flex items-center justify-between px-1 pt-4">
      <p className="text-sm text-gray-500">Showing {from}–{to} of {totalElements}</p>
      <div className="flex gap-1">
        <button className="btn-outline btn-sm btn" onClick={() => onPage(page - 1)} disabled={page === 0}>
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => onPage(i)}
            className={i === page ? 'btn-primary btn-sm btn' : 'btn-outline btn-sm btn'}
          >
            {i + 1}
          </button>
        ))}
        <button className="btn-outline btn-sm btn" onClick={() => onPage(page + 1)} disabled={page >= totalPages - 1}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
