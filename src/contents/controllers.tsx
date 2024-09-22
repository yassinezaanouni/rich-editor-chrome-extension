import cssText from "data-text:~style.css"
import type { PlasmoGetOverlayAnchor } from "plasmo"
import { useEffect, useRef, useState } from "react"

import { StyleButton } from "~components/StyleButton"
import { useFocusListeners } from "~hooks/useFocusListeners"
import { useWindowSelection } from "~hooks/useWindowSelection"
import { COMMON_EMOJIS } from "~utils/constants"
import {
  convertText,
  hasDotAtLineStart,
  isBold,
  isBoldItalic,
  isItalic,
  isSerif,
  isStrikethrough,
  isUnderlined,
  toggleLineDotStart
} from "~utils/textUtils"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const Controllers = () => {
  const { focusedElement } = useFocusListeners()
  const { selection, text: selectedText } = useWindowSelection()
  const [actions, setActions] = useState({
    isSerifSelected: false,
    isBoldSelected: false,
    isItalicSelected: false,
    isUnderlineSelected: false,
    isDotSelected: false,
    isStrikethroughSelected: false
  })
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  useEffect(() => {
    setActions({
      isSerifSelected: isSerif(selectedText),
      isBoldSelected: isBold(selectedText) || isBoldItalic(selectedText),
      isItalicSelected: isItalic(selectedText) || isBoldItalic(selectedText),
      isUnderlineSelected: isUnderlined(selectedText),
      isDotSelected: hasDotAtLineStart(selectedText),
      isStrikethroughSelected: isStrikethrough(selectedText)
    })
  }, [selectedText])

  const applyStyle = (newActions: typeof actions, text: string) => {
    const range = selection?.getRangeAt(0)
    let newText = convertText(text, newActions)

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

    focusedElement.focus()
  }

  const toggle = (
    event: React.MouseEvent,
    styleToToggle: keyof typeof actions
  ) => {
    event.preventDefault()
    event.stopPropagation()

    if (styleToToggle === "isDotSelected") {
      if (!focusedElement) {
        return
      }
    } else {
      if (
        !focusedElement ||
        !selection ||
        selection.rangeCount === 0 ||
        selectedText.length === 0
      ) {
        return
      }
    }

    const newActions = { ...actions, [styleToToggle]: !actions[styleToToggle] }
    setActions(newActions)
    applyStyle(newActions, selectedText)
  }
  const insertEmoji = (emoji: string) => {
    if (!focusedElement) return

    if (
      focusedElement instanceof HTMLInputElement ||
      focusedElement instanceof HTMLTextAreaElement
    ) {
      const start = focusedElement.selectionStart
      const end = focusedElement.selectionEnd
      if (start !== null && end !== null) {
        const currentValue = focusedElement.value
        focusedElement.value =
          currentValue.substring(0, start) + emoji + currentValue.substring(end)
        focusedElement.setSelectionRange(
          start + emoji.length,
          start + emoji.length
        )
      }
    } else {
      const range = selection?.getRangeAt(0)
      if (range) {
        range.deleteContents()
        range.insertNode(document.createTextNode(emoji))
        range.collapse(false)
      }
    }
    focusedElement.focus()
  }
  if (!focusedElement) return null

  const { top = 0, left = 0 } = focusedElement?.getBoundingClientRect() || {}

  return (
    <div
      onMouseDown={(e) => e.preventDefault()}
      className="border flex items-center gap-1 p-[6px]  rounded-[4px] dark"
      style={{
        position: "absolute",
        top: top + window.scrollY,
        left: left + window.scrollX,
        transform: `translateY(-105%)`
      }}>
      <StyleButton
        label="𝗕"
        isActive={actions.isBoldSelected}
        onClick={(e) => toggle(e, "isBoldSelected")}
      />
      <StyleButton
        label="𝐼"
        isActive={actions.isItalicSelected}
        onClick={(e) => toggle(e, "isItalicSelected")}
      />
      <StyleButton
        label="𝚄̲"
        isActive={actions.isUnderlineSelected}
        onClick={(e) => toggle(e, "isUnderlineSelected")}
      />
      <StyleButton
        label="S̶"
        isActive={actions.isStrikethroughSelected}
        onClick={(e) => toggle(e, "isStrikethroughSelected")}
      />
      <StyleButton
        label="•"
        isActive={actions.isDotSelected}
        onClick={(e) => toggle(e, "isDotSelected")}
      />
      <StyleButton
        label={actions.isSerifSelected ? "Serif" : "Sans"}
        isActive={true}
        className="dark:bg-muted w-auto p-2"
        onClick={(e) => toggle(e, "isSerifSelected")}
      />

      <div className="group relative inline-block">
        <StyleButton
          label={COMMON_EMOJIS[0].label}
          isActive={false}
          onClick={() => insertEmoji(COMMON_EMOJIS[0].label)}
        />
        <div className="absolute left-0 z-10 w-[150px] mt-1 bg-background border border-border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
          <div className="grid grid-cols-3 gap-1 p-2">
            {COMMON_EMOJIS.slice(1).map((emoji) => (
              <StyleButton
                isActive={false}
                label={emoji.label}
                key={emoji.name}
                className="hover:bg-accent flex items-center justify-center w-8 h-8 rounded"
                onClick={() => insertEmoji(emoji.label)}
                title={emoji.name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Controllers
