import { Children, cloneElement, isValidElement, useId, useRef } from 'react'
import type { ReactElement, ReactNode, Ref } from 'react'
import { createPortal } from 'react-dom'
import { useTooltip, type TooltipPlacement } from './useTooltip'
import styles from './Tooltip.module.css'

interface Props {
  content: ReactNode
  placement?: TooltipPlacement
  delay?: number
  children: ReactElement
}

interface TriggerRefAttribute {
  ref?: Ref<Element>
}

/**
 * Tooltip primitive. Wraps a single child trigger (HTML or SVG element) and
 * displays an HTML overlay portaled to `document.body` on hover (after `delay`)
 * or on focus (immediately). Escape closes; pointerleave / blur closes.
 *
 * The child element receives `onPointerEnter` / `onPointerLeave` / `onFocus` /
 * `onBlur` listeners and an `aria-describedby` linked to the tooltip id while
 * open. Existing handlers on the child are preserved.
 */
export function Tooltip({ content, placement = 'top', delay = 300, children }: Props) {
  const triggerRef = useRef<Element | null>(null)
  const id = useId()
  const { open, position, handlers } = useTooltip(triggerRef, placement, delay)

  const child = Children.only(children)
  if (!isValidElement(child)) return child

  const childProps = child.props as Record<string, unknown>
  const compose = <E,>(own: ((e: E) => void) | undefined, mine: () => void) => (e: E) => {
    own?.(e)
    mine()
  }

  const triggerProps: Record<string, unknown> & TriggerRefAttribute = {
    onPointerEnter: compose(childProps.onPointerEnter as ((e: unknown) => void) | undefined, handlers.onPointerEnter),
    onPointerLeave: compose(childProps.onPointerLeave as ((e: unknown) => void) | undefined, handlers.onPointerLeave),
    onPointerDown:  compose(childProps.onPointerDown  as ((e: unknown) => void) | undefined, handlers.onPointerDown),
    onFocus:        compose(childProps.onFocus        as ((e: unknown) => void) | undefined, handlers.onFocus),
    onBlur:         compose(childProps.onBlur         as ((e: unknown) => void) | undefined, handlers.onBlur),
    ref: (node: Element | null) => {
      triggerRef.current = node
      const existing = (child as unknown as { ref?: Ref<Element> }).ref
      if (typeof existing === 'function') existing(node)
      else if (existing && typeof existing === 'object' && existing !== null) {
        (existing as { current: Element | null }).current = node
      }
    },
    'aria-describedby': open ? id : (childProps['aria-describedby'] as string | undefined),
  }

  const trigger = cloneElement(child, triggerProps)

  return (
    <>
      {trigger}
      {open && content !== null && content !== undefined && content !== '' && createPortal(
        <div
          id={id}
          role="tooltip"
          className={styles.tooltip}
          data-placement={placement}
          style={{ left: position.x, top: position.y }}
        >
          {content}
        </div>,
        document.body,
      )}
    </>
  )
}
