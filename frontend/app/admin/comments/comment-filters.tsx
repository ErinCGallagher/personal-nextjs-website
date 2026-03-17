/** Status and post filter controls for the comment moderation panel. */

"use client";

export type StatusFilter = "" | "Pending" | "Approved" | "Rejected";

interface CommentFiltersProps {
  filter: StatusFilter;
  postFilter: string;
  uniquePostSlugs: string[];
  onStatusChange: (status: StatusFilter) => void;
  onPostChange: (slug: string) => void;
}

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "" },
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
];

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
        active ? "text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
      }`}
      style={active ? { backgroundColor: "var(--grey-blue)" } : undefined}
    >
      {children}
    </button>
  );
}

export default function CommentFilters({
  filter,
  postFilter,
  uniquePostSlugs,
  onStatusChange,
  onPostChange,
}: CommentFiltersProps) {
  return (
    <>
      <div className="mb-4">
        <h2 className="text-sm font-medium text-gray-700 mb-2">Filter by Status</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {STATUS_OPTIONS.map(({ label, value }) => (
            <FilterButton key={value} active={filter === value} onClick={() => onStatusChange(value)}>
              {label}
            </FilterButton>
          ))}
        </div>
      </div>

      {uniquePostSlugs.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Filter by Post</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <FilterButton active={postFilter === ""} onClick={() => onPostChange("")}>
              All Posts
            </FilterButton>
            {uniquePostSlugs.map((slug) => (
              <FilterButton key={slug} active={postFilter === slug} onClick={() => onPostChange(slug)}>
                {slug}
              </FilterButton>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
