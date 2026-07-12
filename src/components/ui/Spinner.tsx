import { cn } from '../../utils'

export const Spinner = ({ className }: { className?: string }) => (
  <div className={cn('animate-spin rounded-full border-2 border-gray-200 border-t-primary-500 w-5 h-5', className)} />
)

export const PageSpinner = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <Spinner className="w-8 h-8" />
  </div>
)
