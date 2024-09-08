import { useEffect, useRef, useState } from "react"

export const useFocusListeners = () => {
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
              setupListeners(node as Document | ShadowRoot)
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

  return { focusedElement }
}
