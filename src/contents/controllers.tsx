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
    const newTextNode = document.createTextNode(newText)
    range.deleteContents()
    range.insertNode(newTextNode)

    range.setStartAfter(newTextNode)
    range.setEndAfter(newTextNode)
    selection.removeAllRanges()
    selection.addRange(range)

    const inputEvent = new Event("input", { bubbles: true, cancelable: true })
    focusedElement.dispatchEvent(inputEvent)
    focusedElement.focus()
  }

  if (!focusedElement) return null

  const { top = 0, left = 0 } = focusedElement?.getBoundingClientRect() || {}

  return (
    <div
      className="border-y flex items-center gap-1 p-2 overflow-hidden text-black bg-white border-black rounded-lg"
      style={{
        position: "absolute",
        top: top,
        left: left,
        transform: `translateY(-100%)`
      }}>
      <StyleButton
        label="B"
        isActive={actions.isBoldSelected}
        onClick={(e) =>
          toggle(e, { ...actions, isBoldSelected: !actions.isBoldSelected })
        }
      />
      <StyleButton
        label="I"
        isActive={actions.isItalicSelected}
        onClick={(e) =>
          toggle(e, { ...actions, isItalicSelected: !actions.isItalicSelected })
        }
      />
      <StyleButton
        label={actions.isSerifSelected ? "Serif" : "Sans"}
        isActive={true}
        className="bg-zinc-200 w-auto p-2"
        onClick={(e) =>
          toggle(e, { ...actions, isSerifSelected: !actions.isSerifSelected })
        }
      />
    </div>
  )
}

export default Controllers
