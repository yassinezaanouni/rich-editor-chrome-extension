import { UNICODES } from "~utils/constants"

export const convertText = (text: string, localActions: any) => {
  let styleType: "bold" | "italic" | "boldItalic" | null = null
  if (localActions.isBoldSelected) styleType = "bold"
  if (localActions.isItalicSelected) styleType = "italic"
  if (localActions.isBoldSelected && localActions.isItalicSelected) {
    styleType = "boldItalic"
  }

  text = text.normalize("NFKD")

  if (!styleType) return text

  const selectedStyle = localActions.isSerifSelected
    ? UNICODES[styleType].serif
    : UNICODES[styleType].sans

  return text
    .split("")
    .map((char) => {
      let charCode = char.charCodeAt(0)

      if (charCode >= 97 && charCode <= 122) {
        return String.fromCodePoint(selectedStyle.lowerA + (charCode - 97))
      } else if (charCode >= 65 && charCode <= 90) {
        return String.fromCodePoint(selectedStyle.upperA + (charCode - 65))
      } else if (charCode >= 48 && charCode <= 57 && styleType !== "italic") {
        return String.fromCodePoint(selectedStyle.zero + (charCode - 48))
      }
      return char
    })
    .join("")
}

export function isSerif(text: string) {
  if (text.length === 0) return false

  const code = text.codePointAt(0)
  if (!code) return false

  for (const style of ["bold", "italic", "boldItalic"] as const) {
    const ranges = UNICODES[style].serif

    if (
      (code >= ranges.lowerA && code <= ranges.lowerZ) ||
      (code >= ranges.upperA && code <= ranges.upperZ) ||
      (ranges.zero && code >= ranges.zero && code <= ranges.nine)
    ) {
      return true
    }
  }

  return false
}

export function isBold(text: string) {
  if (text.length === 0) return false

  const code = text.codePointAt(0)
  if (!code) return false

  const ranges = UNICODES.bold

  return (
    (code >= ranges.serif.lowerA && code <= ranges.serif.lowerZ) ||
    (code >= ranges.serif.upperA && code <= ranges.serif.upperZ) ||
    (code >= ranges.serif.zero && code <= ranges.serif.nine) ||
    (code >= ranges.sans.lowerA && code <= ranges.sans.lowerZ) ||
    (code >= ranges.sans.upperA && code <= ranges.sans.upperZ) ||
    (code >= ranges.sans.zero && code <= ranges.sans.nine)
  )
}

export function isItalic(text: string) {
  if (text.length === 0) return false

  const code = text.codePointAt(0)
  if (!code) return false

  const ranges = UNICODES.italic

  return (
    (code >= ranges.serif.lowerA && code <= ranges.serif.lowerZ) ||
    (code >= ranges.serif.upperA && code <= ranges.serif.upperZ) ||
    (code >= ranges.sans.lowerA && code <= ranges.sans.lowerZ) ||
    (code >= ranges.sans.upperA && code <= ranges.sans.upperZ)
  )
}

export function isBoldItalic(text: string) {
  if (text.length === 0) return false

  const code = text.codePointAt(0)
  if (!code) return false

  const ranges = UNICODES.boldItalic

  return (
    (code >= ranges.serif.lowerA && code <= ranges.serif.lowerZ) ||
    (code >= ranges.serif.upperA && code <= ranges.serif.upperZ) ||
    (code >= ranges.serif.zero && code <= ranges.serif.nine) ||
    (code >= ranges.sans.lowerA && code <= ranges.sans.lowerZ) ||
    (code >= ranges.sans.upperA && code <= ranges.sans.upperZ) ||
    (code >= ranges.sans.zero && code <= ranges.sans.nine)
  )
}
