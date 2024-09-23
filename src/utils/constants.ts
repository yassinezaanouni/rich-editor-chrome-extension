export const UNICODES = {
  bold: {
    serif: {
      lowerA: 0x1d41a,
      lowerZ: 0x1d433,
      upperA: 0x1d400,
      upperZ: 0x1d419,
      zero: 0x1d7ce,
      nine: 0x1d7d7
    },
    sans: {
      lowerA: 0x1d5ee,
      lowerZ: 0x1d607,
      upperA: 0x1d5d4,
      upperZ: 0x1d5ed,
      zero: 0x1d7ec,
      nine: 0x1d7f5
    }
  },
  italic: {
    serif: {
      lowerA: 0x1d44e,
      lowerZ: 0x1d467,
      upperA: 0x1d434,
      upperZ: 0x1d44d
    },
    sans: {
      lowerA: 0x1d622,
      lowerZ: 0x1d63b,
      upperA: 0x1d608,
      upperZ: 0x1d621
    }
  },
  boldItalic: {
    serif: {
      lowerA: 0x1d482,
      lowerZ: 0x1d49b,
      upperA: 0x1d468,
      upperZ: 0x1d481,
      zero: 0x1d7ce,
      nine: 0x1d7d7
    },
    sans: {
      lowerA: 0x1d656,
      lowerZ: 0x1d66f,
      upperA: 0x1d63c,
      upperZ: 0x1d655,
      zero: 0x1d7ec,
      nine: 0x1d7f5
    }
  },
  strikethrough: {
    char: "\u0336" // Combining long stroke overlay
  }
} as const

export const COMMON_EMOJIS = [
  { label: "✅", name: "Check Mark" },
  { label: "✓", name: "Check Mark" },
  { label: "🚀", name: "Rocket" },
  { label: "🎉", name: "Party Popper" },
  { label: "💎", name: "Blue Diamond" },
  { label: "✨", name: "Sparkles" },
  { label: "💸", name: "Money with Wings" },
  { label: "🏆", name: "Trophy" },
  { label: "👌", name: "OK Hand" },
  { label: "🔥", name: "Fire" }
]
export const COMMON_DOTS = [
  { label: "•", name: "Bullet" },
  { label: "●", name: "Circle Filled" },
  { label: "○", name: "Circle" },
  { label: "■", name: "Square" },
  { label: "▪", name: "Small Square" },
  { label: "►", name: "Triangle" }
]
