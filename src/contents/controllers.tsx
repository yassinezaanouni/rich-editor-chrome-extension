import cssText from "data-text:~style.css"
import type { PlasmoGetOverlayAnchor } from "plasmo"
import { useEffect, useRef, useState } from "react"

import { useWindowSelection } from "~hooks/useWindowSelection"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}
const UNICODES = {
  bold: {
    serif: {
      lowerA: 0x1d41a,
      lowerZ: 0x1d433,
      upperA: 0x1d400,
      upperZ: 0x1d419,
      zero: 0x1d7ce,
      nine: 0x1d7d7
    }, // Bold serif
    sans: {
      lowerA: 0x1d5ee,
      lowerZ: 0x1d607,
      upperA: 0x1d5d4,
      upperZ: 0x1d5ed,
      zero: 0x1d7ec,
      nine: 0x1d7f5
    } // Bold sans serif
  },
  italic: {
    // There are no italic numbers in Unicode, so we use the regular numbers
    serif: {
      lowerA: 0x1d44e,
      lowerZ: 0x1d467,
      upperA: 0x1d434,
      upperZ: 0x1d44d
    }, // Italic serif
    sans: {
      lowerA: 0x1d622,
      lowerZ: 0x1d63b,
      upperA: 0x1d608,
      upperZ: 0x1d621
    } // Italic sans serif
  },
  boldItalic: {
    serif: {
      lowerA: 0x1d482,
      lowerZ: 0x1d49b,
      upperA: 0x1d468,
      upperZ: 0x1d481,
      zero: 0x1d7ce,
      nine: 0x1d7d7
    }, // Italic bold serif
    sans: {
      lowerA: 0x1d656,
      lowerZ: 0x1d66f,
      upperA: 0x1d63c,
      upperZ: 0x1d655,
      zero: 0x1d7ec,
      nine: 0x1d7f5
    } // Italic bold sans serif
  }
}

const Controllers = () => {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null)
  const { selection, text: selectedText } = useWindowSelection()

  const [actions, setActions] = useState({
    isSerifSelected: false,
    isBoldSelected: false,
    isItalicSelected: false,
    isBoldItalicSelected: false
  })
  const observerRef = useRef<MutationObserver | null>(null)

  useEffect(() => {
    setActions({
      isSerifSelected: isSerif(selectedText),
      isBoldSelected: isBold(selectedText),
      isItalicSelected: isItalic(selectedText),
      isBoldItalicSelected: isBoldItalic(selectedText)
    })
  }, [selectedText])

  const isEditableElement = (element: HTMLElement): boolean => {
    const editableTypes = [
      "text",
      "password",
      "email",
      "number",
      "search",
      "tel",
      "url"
    ]
    return (
      element.isContentEditable ||
      element.tagName === "TEXTAREA" ||
      (element.tagName === "INPUT" &&
        editableTypes.includes(
          (element as HTMLInputElement).type.toLowerCase()
        )) ||
      element.getAttribute("role") === "textbox" ||
      element.classList.contains("public-DraftEditor-content") ||
      element.classList.contains("ql-editor")
    )
  }

  const handleFocus = (event: FocusEvent) => {
    const target = event.target as HTMLElement
    if (isEditableElement(target)) {
      setFocusedElement(target)
    }
  }

  const handleBlur = () => setFocusedElement(null)

  const addListeners = (element: HTMLElement) => {
    element.addEventListener("focus", handleFocus)
    element.addEventListener("blur", handleBlur)
  }

  const removeListeners = (element: HTMLElement) => {
    element.removeEventListener("focus", handleFocus)
    element.removeEventListener("blur", handleBlur)
  }

  const setupListeners = (root: Document | ShadowRoot = document) => {
    const editableElements = root.querySelectorAll("*")
    editableElements.forEach((el) => {
      if (isEditableElement(el as HTMLElement)) {
        addListeners(el as HTMLElement)
      }
    })
  }

  const checkInitialFocus = () => {
    const activeElement = document.activeElement
    if (activeElement && isEditableElement(activeElement as HTMLElement)) {
      setFocusedElement(activeElement as HTMLElement)
    }
  }

  useEffect(() => {
    setupListeners()
    checkInitialFocus()

    observerRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // @ts-ignore
              setupListeners(node as HTMLElement)
              checkInitialFocus()
            }
          })
        }
      })
    })

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => {
      const cleanup = (root: Document | ShadowRoot = document) => {
        const editableElements = root.querySelectorAll("*")
        editableElements.forEach((el) => {
          if (isEditableElement(el as HTMLElement)) {
            removeListeners(el as HTMLElement)
          }
        })
      }

      cleanup()
      observerRef.current?.disconnect()
    }
  }, [])

  const convertText = (text, localActions) => {
    let styleType
    if (localActions.isBoldSelected) styleType = "bold"
    if (localActions.isItalicSelected) styleType = "italic"
    if (
      (localActions.isBoldSelected && localActions.isItalicSelected) ||
      localActions.isBoldItalicSelected
    ) {
      localActions.isBoldItalicSelected = true
      styleType = "boldItalic"
    }

    console.log("localActions", localActions)
    console.log("localActions", localActions)
    if (!styleType) return text
    // Choose the correct style based on isSerifSelected
    const selectedStyle = localActions.isSerifSelected
      ? UNICODES[styleType].serif
      : UNICODES[styleType].sans

    setActions(localActions)
    text = text.normalize("NFKD")
    return text
      .split("")
      .map((char) => {
        let charCode = char.charCodeAt(0)

        if (charCode >= 97 && charCode <= 122) {
          console.log("'a' to 'z'")
          // 'a' to 'z'
          return String.fromCodePoint(selectedStyle.lowerA + (charCode - 97))
        } else if (charCode >= 65 && charCode <= 90) {
          console.log("'A' to 'Z'")
          // 'A' to 'Z'
          return String.fromCodePoint(selectedStyle.upperA + (charCode - 65))
        } else if (charCode >= 48 && charCode <= 57 && styleType !== "italic") {
          console.log("'0' to '9'")
          // '0' to '9'
          return String.fromCodePoint(selectedStyle.zero + (charCode - 48))
        }
        return char // Non-alphabetical and non-numeric characters are returned as is
      })
      .join("")
  }

  function isSerif(text) {
    if (text.length === 0) return false

    const code = text.codePointAt(0)

    for (const style of ["bold", "italic", "boldItalic"]) {
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

  function isBold(text) {
    if (text.length === 0) return false

    const code = text.codePointAt(0)
    const ranges = UNICODES.bold
    // console.log(code, ranges.serif.upperA, ranges.serif.upperZ)

    return (
      (code >= ranges.serif.lowerA && code <= ranges.serif.lowerZ) ||
      (code >= ranges.serif.upperA && code <= ranges.serif.upperZ) ||
      (code >= ranges.serif.zero && code <= ranges.serif.nine) ||
      (code >= ranges.sans.lowerA && code <= ranges.sans.lowerZ) ||
      (code >= ranges.sans.upperA && code <= ranges.sans.upperZ) ||
      (code >= ranges.sans.zero && code <= ranges.sans.nine)
    )
  }

  function isItalic(text) {
    if (text.length === 0) return false

    const code = text.codePointAt(0)
    const ranges = UNICODES.italic

    return (
      (code >= ranges.serif.lowerA && code <= ranges.serif.lowerZ) ||
      (code >= ranges.serif.upperA && code <= ranges.serif.upperZ) ||
      (code >= ranges.sans.lowerA && code <= ranges.sans.lowerZ) ||
      (code >= ranges.sans.upperA && code <= ranges.sans.upperZ)
    )
    // Note: Italic doesn't have special Unicode for numbers
  }

  function isBoldItalic(text) {
    if (text.length === 0) return false

    const code = text.codePointAt(0)
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

  const toggle = (event: React.MouseEvent, localActions) => {
    event.preventDefault()
    event.stopPropagation()

    if (!focusedElement) return

    if (!selection || selection.rangeCount === 0) {
      console.log("No selection or range count is zero")
      return
    }

    const range = selection.getRangeAt(0)

    if (selectedText.length === 0) {
      console.log("Selected text length is zero")
      return
    }

    const newText = convertText(selectedText, localActions)

    const newTextNode = document.createTextNode(newText)
    range.deleteContents()
    range.insertNode(newTextNode)

    // Restore the selection
    range.setStartAfter(newTextNode)
    range.setEndAfter(newTextNode)
    selection.removeAllRanges()
    selection.addRange(range)

    // Trigger input event to update the element's value
    const inputEvent = new Event("input", { bubbles: true, cancelable: true })
    focusedElement.dispatchEvent(inputEvent)

    // Refocus the element
    focusedElement.focus()
  }

  if (!focusedElement) return null

  const {
    top = 0,
    left = 0,
    height = 0,
    y = 0
  } = focusedElement?.getBoundingClientRect() || {}

  return (
    <div
      className="border-y flex items-center gap-1 p-2 overflow-hidden text-black bg-white border-black rounded-lg"
      style={{
        position: "absolute",
        top: top,
        left: left,
        transform: `translateY(-100%)`
      }}>
      <button
        className={`size-8 hover:bg-zinc-200 flex items-center justify-center transition-all rounded-md ${actions.isBoldSelected || actions.isBoldItalicSelected ? "bg-zinc-200" : ""}`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          const _actions = {
            ...actions,
            isBoldSelected: !actions.isBoldSelected
          }
          toggle(e, _actions)
        }}>
        B
      </button>
      <button
        className={`size-8 hover:bg-zinc-200 flex items-center justify-center transition-all rounded-md ${actions.isItalicSelected || actions.isBoldItalicSelected ? "bg-zinc-200" : ""}`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          const _actions = {
            ...actions,
            isItalicSelected: !actions.isItalicSelected
          }
          toggle(e, _actions)
        }}>
        I
      </button>
      <button
        className={`hover:opacity-80 h-8 transition-all bg-zinc-200 p-2 flex items-center justify-center rounded-md`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          const _actions = {
            ...actions,
            isSerifSelected: !actions.isSerifSelected
          }
          toggle(e, _actions)
        }}>
        {actions.isSerifSelected ? "Serif" : "Sans"}
      </button>
    </div>
  )
}

export default Controllers
