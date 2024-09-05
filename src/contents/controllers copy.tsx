import cssText from "data-text:~style.css"
import type { PlasmoGetOverlayAnchor } from "plasmo"
import { useEffect, useRef, useState } from "react"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const Controllers = () => {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null)
  const observerRef = useRef<MutationObserver | null>(null)

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

  function toItalic(text) {
    const italicLowerA = 0x1d456 // Italic 'a'
    const italicUpperA = 0x1d434 // Italic 'A'
    const italicZero = 0x1d7d8 // Italic '0'

    return text
      .split("")
      .map((char) => {
        const charCode = char.charCodeAt(0)
        if (charCode >= 97 && charCode <= 122) {
          // 'a' to 'z'
          return String.fromCodePoint(italicLowerA + (charCode - 97))
        } else if (charCode >= 65 && charCode <= 90) {
          // 'A' to 'Z'
          return String.fromCodePoint(italicUpperA + (charCode - 65))
        } else if (charCode >= 48 && charCode <= 57) {
          // '0' to '9'
          return String.fromCodePoint(italicZero + (charCode - 48))
        }
        return char // Non-alphabetical and non-numeric characters are returned as is
      })
      .join("")
  }

  const convertToBold = (text) => {
    const boldLowerA = 0x1d41a // Bold 'a'
    const boldUpperA = 0x1d400 // Bold 'A'
    const boldZero = 0x1d7ce // Bold '0'

    // Sans serif
    // const boldLowerA = 0x1d5ee // Bold 'a'
    // const boldUpperA = 0x1d5d4 // Bold 'A'
    // const boldZero = 0x1d7ce // Bold '0'
    return text
      .split("")
      .map((char) => {
        const charCode = char.charCodeAt(0)
        if (charCode >= 97 && charCode <= 122) {
          // 'a' to 'z'
          return String.fromCodePoint(boldLowerA + (charCode - 97))
        } else if (charCode >= 65 && charCode <= 90) {
          // 'A' to 'Z'
          return String.fromCodePoint(boldUpperA + (charCode - 65))
        } else if (charCode >= 48 && charCode <= 57) {
          // '0' to '9'
          return String.fromCodePoint(boldZero + (charCode - 48))
        }
        return char // Non-alphabetical and non-numeric characters are returned as is
      })
      .join("")
  }

  const convertFromBold = (text) => {
    // return text.normalize("NFKD")
  }

  const toggleBold = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (!focusedElement) return

    const selection = window.getSelection()
    console.log("Selection object:", selection)
    if (!selection || selection.rangeCount === 0) {
      console.log("No selection or range count is zero")
      return
    }

    const range = selection.getRangeAt(0)

    const selectedText = selection.toString()
    console.log("Selected text:", selectedText)

    if (selectedText.length === 0) {
      console.log("Selected text length is zero")
      return
    }

    // Updated regular expression to use Unicode escape sequences
    const isBold = /[\u{1D400}-\u{1D7FF}]/u.test(selectedText)
    console.log("Is bold:", isBold)
    const newText = isBold
      ? convertFromBold(selectedText)
      : convertToBold(selectedText)

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
      style={{
        position: "absolute",
        top: top,
        left: left,
        transform: `translateY(-100%)`
      }}>
      <button
        className="bg-red-300 opacity-75"
        onMouseDown={(e) => e.preventDefault()}
        onClick={toggleBold}>
        B
      </button>
    </div>
  )
}

export default Controllers
