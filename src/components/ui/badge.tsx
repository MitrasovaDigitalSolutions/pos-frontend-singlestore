import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "border-emerald-600/30 bg-emerald-600 text-white hover:bg-emerald-700",
        secondary:
          "border-slate-200/80 bg-slate-100 text-slate-700 hover:bg-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
        destructive:
          "border-rose-500/20 bg-rose-50 text-rose-700 hover:bg-rose-100/80 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-400",
        danger:
          "border-rose-500/20 bg-rose-50 text-rose-700 hover:bg-rose-100/80 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-400",
        success:
          "border-emerald-500/20 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400",
        warning:
          "border-amber-500/20 bg-amber-50 text-amber-700 hover:bg-amber-100/80 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400",
        info:
          "border-blue-500/20 bg-blue-50 text-blue-700 hover:bg-blue-100/80 dark:border-blue-500/30 dark:bg-blue-950/40 dark:text-blue-400",
        purple:
          "border-indigo-500/20 bg-indigo-50 text-indigo-700 hover:bg-indigo-100/80 dark:border-indigo-500/30 dark:bg-indigo-950/40 dark:text-indigo-400",
        cyan:
          "border-cyan-500/20 bg-cyan-50 text-cyan-700 hover:bg-cyan-100/80 dark:border-cyan-500/30 dark:bg-cyan-950/40 dark:text-cyan-400",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
