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
      className={`size-8 hover:bg-zinc-200 flex items-center justify-center transition-all rounded-md ${
        isActive ? "bg-zinc-200" : ""
      } ${className}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}>
      {label}
    </button>
  )
}
