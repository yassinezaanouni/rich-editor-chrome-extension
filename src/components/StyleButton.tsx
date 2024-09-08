import React from "react"

interface StyleButtonProps {
  label: string
  isActive: boolean
  onClick: (e: React.MouseEvent) => void
  className?: string
}

export const StyleButton: React.FC<StyleButtonProps> = ({
  label,
  isActive,
  onClick,
  className = ""
}) => {
  return (
    <button
      className={`size-8 hover:bg-zinc-200 dark:hover:bg-muted flex items-center p-1 justify-center transition-all rounded-sm ${
        isActive ? "bg-muted" : ""
      } ${className}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}>
      {label}
    </button>
  )
}
