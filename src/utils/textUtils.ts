import { UNICODES } from "~utils/constants"

const UNDERLINE_CHAR = "\u0332" // Unicode for "combining low line" (single underline)

export const convertText = (text: string, localActions: any) => {
  text = text.normalize("NFKD")

  text = toggleLineDotStart(text, localActions.isDotSelected)

  // Remove existing underlines first
  text = text.replace(new RegExp(UNDERLINE_CHAR, "g"), "")

  // Remove existing underlines and strikethroughs first
  text = text.replace(new RegExp(UNDERLINE_CHAR, "g"), "")
  text = text.replace(new RegExp(UNICODES.strikethrough.char, "g"), "")

  let result = text
    .split("")
    .map((char, index) => {
      let charCode = char.charCodeAt(0)
      let newChar = char

      // Determine the style to apply
      let styleType: "normal" | "bold" | "italic" | "boldItalic" = "normal"
      if (localActions.isBoldSelected && localActions.isItalicSelected) {
        styleType = "boldItalic"
      } else if (localActions.isBoldSelected) {
        styleType = "bold"
      } else if (localActions.isItalicSelected) {
        styleType = "italic"
      }

      // Apply the style if it's not "normal"
      if (styleType !== "normal") {
        const selectedStyle = localActions.isSerifSelected
          ? UNICODES[styleType].serif
          : UNICODES[styleType].sans

        if (charCode >= 97 && charCode <= 122) {
          newChar = String.fromCodePoint(selectedStyle.lowerA + (charCode - 97))
        } else if (charCode >= 65 && charCode <= 90) {
          newChar = String.fromCodePoint(selectedStyle.upperA + (charCode - 65))
        } else if (charCode >= 48 && charCode <= 57 && styleType !== "italic") {
          newChar = String.fromCodePoint(selectedStyle.zero + (charCode - 48))
        }
      }
      // Apply strikethrough if selected
      if (localActions.isStrikethroughSelected && char !== " ") {
        if (index === 0) newChar = UNICODES.strikethrough.char + newChar

        newChar += UNICODES.strikethrough.char
      }
      // Apply underline if selected
      if (localActions.isUnderlineSelected) {
        newChar += UNDERLINE_CHAR
      }

      return newChar
    })
    .join("")

  return result
}

export function isSerif(text: string) {
  if (text.length === 0) return false

  for (let i = 0; i < text.length; i++) {
    const code = text.codePointAt(i)
    if (!code) continue

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
  }

  return false
}

export function isBold(text: string) {
  if (text.length === 0) return false

  const ranges = UNICODES.bold
  let boldCount = 0

  for (let i = 0; i < text.length; i++) {
    const code = text.codePointAt(i)
    if (!code) continue

    if (
      (code >= ranges.serif.lowerA && code <= ranges.serif.lowerZ) ||
      (code >= ranges.serif.upperA && code <= ranges.serif.upperZ) ||
      (code >= ranges.serif.zero && code <= ranges.serif.nine) ||
      (code >= ranges.sans.lowerA && code <= ranges.sans.lowerZ) ||
      (code >= ranges.sans.upperA && code <= ranges.sans.upperZ) ||
      (code >= ranges.sans.zero && code <= ranges.sans.nine)
    ) {
      boldCount++
    }
  }

  return boldCount > 0
}

export function isItalic(text: string) {
  if (text.length === 0) return false

  const ranges = UNICODES.italic
  let italicCount = 0

  for (let i = 0; i < text.length; i++) {
    const code = text.codePointAt(i)
    if (!code) continue

    if (
      (code >= ranges.serif.lowerA && code <= ranges.serif.lowerZ) ||
      (code >= ranges.serif.upperA && code <= ranges.serif.upperZ) ||
      (code >= ranges.sans.lowerA && code <= ranges.sans.lowerZ) ||
      (code >= ranges.sans.upperA && code <= ranges.sans.upperZ)
    ) {
      italicCount++
    }
  }

  return italicCount > 0
}

export function isBoldItalic(text: string) {
  if (text.length === 0) return false

  for (let i = 0; i < text.length; i++) {
    const code = text.codePointAt(i)
    if (!code) continue

    const ranges = UNICODES.boldItalic

    if (
      (code >= ranges.serif.lowerA && code <= ranges.serif.lowerZ) ||
      (code >= ranges.serif.upperA && code <= ranges.serif.upperZ) ||
      (code >= ranges.serif.zero && code <= ranges.serif.nine) ||
      (code >= ranges.sans.lowerA && code <= ranges.sans.lowerZ) ||
      (code >= ranges.sans.upperA && code <= ranges.sans.upperZ) ||
      (code >= ranges.sans.zero && code <= ranges.sans.nine)
    ) {
      return true
    }
  }

  return false
}
export function isUnderlined(text: string) {
  return text.includes(UNDERLINE_CHAR)
}

export function toggleLineDotStart(
  text: string,
  isDotSelected: boolean
): string {
  return text
    .split("\n")
    .map((line) => {
      const trimmedLine = line.trim()
      if (isDotSelected) {
        return trimmedLine.startsWith("•") ? line : `• ${line}`
      } else {
        return trimmedLine.startsWith("•")
          ? trimmedLine.slice(1).trimStart()
          : line
      }
    })
    .join("\n")
}

export function hasDotAtLineStart(text: string): boolean {
  // Check if any line in the text starts with a dot
  return text.split("\n").some((line) => line.trim().startsWith("•"))
}

export function isStrikethrough(text: string): boolean {
  return text.includes(UNICODES.strikethrough.char)
}
