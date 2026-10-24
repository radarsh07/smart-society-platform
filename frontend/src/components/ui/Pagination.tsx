interface PaginationProps {
  pageNumber: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function Pagination({ pageNumber, totalPages, onPrevious, onNext }: PaginationProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
      <span>
        Page {pageNumber + 1} of {Math.max(totalPages, 1)}
      </span>
      <div className="flex gap-2">
        <button className="rounded-xl border border-white/10 px-3 py-2 disabled:opacity-40" onClick={onPrevious} disabled={pageNumber <= 0}>
          Previous
        </button>
        <button className="rounded-xl border border-white/10 px-3 py-2 disabled:opacity-40" onClick={onNext} disabled={pageNumber + 1 >= totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}
