import cssText from "data-text:~style.css"
import type { PlasmoGetOverlayAnchor } from "plasmo"
import { useEffect, useRef, useState } from "react"

import { StyleButton } from "~components/StyleButton"
import { useWindowSelection } from "~hooks/useWindowSelection"
import {
  isEditableElement,
  removeListeners,
  setupListeners
} from "~utils/domUtils"
import {
  convertText,
  isBold,
  isBoldItalic,
  isItalic,
  isSerif
} from "~utils/textUtils"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const Controllers = () => {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null)
  const { selection, text: selectedText } = useWindowSelection()
  const [actions, setActions] = useState({
    isSerifSelected: false,
    isBoldSelected: false,
    isItalicSelected: false
  })
  const observerRef = useRef<MutationObserver | null>(null)

  useEffect(() => {
    setActions({
      isSerifSelected: isSerif(selectedText),
      isBoldSelected: isBold(selectedText) || isBoldItalic(selectedText),
      isItalicSelected: isItalic(selectedText) || isBoldItalic(selectedText)
    })
  }, [selectedText])

  const handleFocus = (event: FocusEvent) => {
    const target = event.target as HTMLElement
    if (isEditableElement(target)) {
      setFocusedElement(target)
    }
  }

  const handleBlur = () => setFocusedElement(null)

  useEffect(() => {
    setupListeners(document, handleFocus, handleBlur)
    const activeElement = document.activeElement
    if (activeElement && isEditableElement(activeElement as HTMLElement)) {
      setFocusedElement(activeElement as HTMLElement)
    }

    observerRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              setupListeners(node as HTMLElement, handleFocus, handleBlur)
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
      removeListeners(document, handleFocus, handleBlur)
      observerRef.current?.disconnect()
    }
  }, [])

  const toggle = (event: React.MouseEvent, localActions) => {
    event.preventDefault()
    event.stopPropagation()

    if (
      !focusedElement ||
      !selection ||
      selection.rangeCount === 0 ||
      selectedText.length === 0
    )
      return

    const range = selection.getRangeAt(0)
    const newText = convertText(selectedText, localActions)

    if (
      focusedElement instanceof HTMLInputElement ||
      focusedElement instanceof HTMLTextAreaElement
    ) {
      const start = focusedElement.selectionStart
      const end = focusedElement.selectionEnd
      if (start !== null && end !== null) {
        const currentValue = focusedElement.value
        focusedElement.value =
          currentValue.substring(0, start) +
          newText +
          currentValue.substring(end)
        focusedElement.setSelectionRange(start, start + newText.length)
      }
    } else {
      range.deleteContents()
      range.insertNode(document.createTextNode(newText))
      range.setStart(range.endContainer, range.endOffset)
    }

    // Trigger input event to update the element's value
    // const inputEvent = new Event("input", { bubbles: true, cancelable: true })
    // focusedElement.dispatchEvent(inputEvent)

    // Refocus the element
    focusedElement.focus()
  }

  if (!focusedElement) return null

  const { top = 0, left = 0 } = focusedElement?.getBoundingClientRect() || {}

  return (
    <div
      className="border flex items-center gap-1 p-[6px] overflow-hidden rounded-[4px] dark"
      style={{
        position: "absolute",
        top: top + window.scrollY,
        left: left + window.scrollX,
        transform: `translateY(-105%)`
      }}>
      <StyleButton
        label="𝗕"
        isActive={actions.isBoldSelected}
        onClick={(e) =>
          toggle(e, { ...actions, isBoldSelected: !actions.isBoldSelected })
        }
      />
      <StyleButton
        label="𝐼"
        isActive={actions.isItalicSelected}
        onClick={(e) =>
          toggle(e, { ...actions, isItalicSelected: !actions.isItalicSelected })
        }
      />
      <StyleButton
        label={actions.isSerifSelected ? "Serif" : "Sans"}
        isActive={true}
        className="dark:bg-muted w-auto p-2"
        onClick={(e) =>
          toggle(e, { ...actions, isSerifSelected: !actions.isSerifSelected })
        }
      />
    </div>
  )
}

export default Controllers
