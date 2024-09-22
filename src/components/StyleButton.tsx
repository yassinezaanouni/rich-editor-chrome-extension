import React, { type ButtonHTMLAttributes } from "react"

interface StyleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  isActive: boolean
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
}

export const StyleButton: React.FC<StyleButtonProps> = ({
  label,
  isActive,
  onClick,
  className = "",
  ...props
}) => {
  return (
    <button
      className={`size-8 hover:bg-zinc-200 dark:hover:bg-muted flex items-center p-1 justify-center transition-all rounded-sm ${
        isActive ? "bg-muted" : ""
      } ${className}`}
      onClick={onClick}
      {...props}>
      {label}
    </button>
  )
}
