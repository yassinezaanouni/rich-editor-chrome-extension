export const isEditableElement = (element: HTMLElement): boolean => {
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
    // (element.tagName === "INPUT" &&
    //   editableTypes.includes(
    //     (element as HTMLInputElement).type.toLowerCase()
    //   )) ||
    element.getAttribute("role") === "textbox" ||
    element.classList.contains("public-DraftEditor-content") ||
    element.classList.contains("ql-editor")
  )
}

export const setupListeners = (
  root: Document | HTMLElement,
  handleFocus: (event: FocusEvent) => void,
  handleBlur: (event: FocusEvent) => void
) => {
  const editableElements = root.querySelectorAll("*")
  editableElements.forEach((el) => {
    if (isEditableElement(el as HTMLElement)) {
      el.addEventListener("focus", handleFocus)
      el.addEventListener("blur", handleBlur)
    }
  })
}

export const removeListeners = (
  root: Document | HTMLElement,
  handleFocus: (event: FocusEvent) => void,
  handleBlur: (event: FocusEvent) => void
) => {
  const editableElements = root.querySelectorAll("*")
  editableElements.forEach((el) => {
    if (isEditableElement(el as HTMLElement)) {
      el.removeEventListener("focus", handleFocus)
      el.removeEventListener("blur", handleBlur)
    }
  })
}
