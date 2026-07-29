"use client"

import { cn } from "@/lib/utils"

// ─── Types ─────────────────────────────────────────────────────────────────────

type ShowWhenProps = {
  /** The condition to evaluate. When truthy, children are rendered/shown. */
  condition: unknown
  /**
   * Controls how hiding works:
   * - `true` (default): component is unmounted from the DOM when condition is falsy.
   * - `false`: component stays in the DOM but is visually hidden via CSS.
   */
  unmount?: boolean
  /** Optional className applied to the wrapper when `unmount` is false. */
  className?: string
  children: React.ReactNode
}

type ShowElseProps = {
  /** The condition to evaluate. When falsy, children are rendered/shown. */
  condition: unknown
  /**
   * Controls how hiding works:
   * - `true` (default): component is unmounted from the DOM when condition is truthy.
   * - `false`: component stays in the DOM but is visually hidden via CSS.
   */
  unmount?: boolean
  /** Optional className applied to the wrapper when `unmount` is false. */
  className?: string
  children: React.ReactNode
}

type ShowFallbackProps = {
  /** The value to check. Shows children when value is null, undefined, or empty string. */
  value: unknown
  /**
   * Controls how hiding works:
   * - `true` (default): component is unmounted from the DOM when value is present.
   * - `false`: component stays in the DOM but is visually hidden via CSS.
   */
  unmount?: boolean
  /** Optional className applied to the wrapper when `unmount` is false. */
  className?: string
  children: React.ReactNode
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Wraps children with a hidden container when `unmount` is false.
 * Uses `display: none` to hide while keeping the component mounted (preserving state).
 */
function HiddenWrapper({
  visible,
  className,
  children,
}: {
  visible: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      data-slot="show-wrapper"
      className={cn(className)}
      style={{ display: visible ? undefined : "none" }}
      aria-hidden={!visible}
    >
      {children}
    </div>
  )
}

// ─── Components ────────────────────────────────────────────────────────────────

/**
 * Renders children when `condition` is truthy.
 *
 * @example
 * // Unmount mode (default) — removes from DOM
 * <Show.When condition={isLoggedIn}>
 *   <Dashboard />
 * </Show.When>
 *
 * @example
 * // Hide mode — keeps in DOM but visually hidden
 * <Show.When condition={isActive} unmount={false}>
 *   <ExpensiveComponent />
 * </Show.When>
 */
function When({ condition, unmount = true, className, children }: ShowWhenProps) {
  if (unmount) {
    return condition ? <>{children}</> : null
  }

  return (
    <HiddenWrapper visible={!!condition} className={className}>
      {children}
    </HiddenWrapper>
  )
}
When.displayName = "Show.When"

/**
 * Renders children when `condition` is falsy. The inverse of `Show.When`.
 *
 * @example
 * <Show.Else condition={isLoggedIn}>
 *   <LoginForm />
 * </Show.Else>
 */
function Else({ condition, unmount = true, className, children }: ShowElseProps) {
  if (unmount) {
    return condition ? null : <>{children}</>
  }

  return (
    <HiddenWrapper visible={!condition} className={className}>
      {children}
    </HiddenWrapper>
  )
}
Else.displayName = "Show.Else"

/**
 * Renders children when `value` is null, undefined, or empty string.
 * Useful for showing placeholder/fallback content.
 *
 * @example
 * <Show.Fallback value={user?.name}>
 *   <Skeleton className="h-4 w-24" />
 * </Show.Fallback>
 */
function Fallback({ value, unmount = true, className, children }: ShowFallbackProps) {
  const isEmpty = value === null || value === undefined || value === ""

  if (unmount) {
    return isEmpty ? <>{children}</> : null
  }

  return (
    <HiddenWrapper visible={isEmpty} className={className}>
      {children}
    </HiddenWrapper>
  )
}
Fallback.displayName = "Show.Fallback"

// ─── Compound Export ───────────────────────────────────────────────────────────

/**
 * Conditional rendering utilities using compound component pattern.
 *
 * @example
 * <Show.When condition={isReady}>
 *   <Content />
 * </Show.When>
 *
 * <Show.Else condition={isReady}>
 *   <Loading />
 * </Show.Else>
 *
 * <Show.Fallback value={data}>
 *   <Skeleton />
 * </Show.Fallback>
 */
const Show = {
  When,
  Else,
  Fallback,
}

export { Show }
