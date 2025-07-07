// src/components/shared/ProgressBar.tsx

type Props = {
  percentage: number
}

export function ProgressBar({ percentage }: Props) {
  return (
    <div className="w-full bg-gray-200 rounded h-3 overflow-hidden">
      <div
        className="bg-green-500 h-full transition-all duration-300 ease-in-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
