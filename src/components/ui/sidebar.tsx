"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { PanelLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>((props, ref) => {
  const { side = "left", variant = "sidebar", collapsible = "offcanvas", className, style, children, ...rest } = props
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  // Static sidebar: always visible, no collapse/offcanvas behavior.
  if (collapsible === "none") {
    return (
      <div
        ref={ref}
        data-side={side}
        data-variant={variant}
        className={cn(
          "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
          className
        )}
        style={{ "--sidebar-width": SIDEBAR_WIDTH, ...style } as React.CSSProperties}
        {...rest}
      >
        {children}
      </div>
    )
  }

  // Mobile: render inside a slide-in Sheet, driven by the shared sidebar state.
  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          data-side={side}
          data-variant={variant}
          side={side}
          className="w-(--sidebar-width-mobile) max-w-[85%] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
          style={{ "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE } as React.CSSProperties}
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <TooltipProvider delayDuration={0}>
            <div ref={ref} className="flex h-full w-full flex-col" {...rest}>
              {children}
            </div>
          </TooltipProvider>
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop: a fixed panel plus an in-flow spacer that reserves its width so
  // page content is pushed over rather than covered. The spacer and the fixed
  // panel both animate width/position together based on `data-state`.
  return (
    <TooltipProvider delayDuration={0}>
      <div
        className="group peer hidden md:block text-sidebar-foreground"
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            ...style,
          } as React.CSSProperties
        }
      >
        {/* Spacer: reserves layout space in the flex row */}
        <div
          className={cn(
            "relative h-full w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
            "group-data-[collapsible=offcanvas]:w-0",
            "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
            "group-data-[side=right]:rotate-180"
          )}
        />
        {/* Fixed visual panel */}
        <div
          ref={ref}
          data-side={side}
          data-variant={variant}
          className={cn(
            "fixed inset-y-0 z-10 flex h-svh w-(--sidebar-width) flex-col transition-[left,right,width] duration-200 ease-linear",
            side === "left"
              ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
              : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
            "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
            variant === "floating"
              ? "p-2"
              : side === "left"
                ? "border-r border-sidebar-border"
                : "border-l border-sidebar-border",
            className
          )}
          {...rest}
        >
          <div
            className={cn(
              "flex h-full w-full flex-col bg-sidebar",
              variant === "floating" && "rounded-lg border border-sidebar-border shadow-lg"
            )}
          >
            {children}
          </div>
          <SidebarRail />
        </div>
      </div>
    </TooltipProvider>
  )
})
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { tooltip?: string }
>(({ className, onClick, tooltip = "Toggle Sidebar", ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={ref}
            onClick={(e) => {
              onClick?.(e)
              toggleSidebar()
            }}
            variant="ghost"
            size="icon"
            className={cn("h-9 w-9", className)}
            {...props}
          >
            <PanelLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
            <span className="sr-only">{tooltip}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" align="center">
          {tooltip}
          <kbd className="hidden lg:block ml-1 h-4 px-1.5 text-xs font-mono bg-muted border rounded">
            ⌘{SIDEBAR_KEYBOARD_SHORTCUT.toUpperCase()}
          </kbd>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarRail = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  ({ className, ...props }, ref) => {
    const { toggleSidebar, state } = useSidebar()

    return (
      <button
        ref={ref}
        type="button"
        onClick={toggleSidebar}
        title="Toggle Sidebar"
        aria-label="Toggle Sidebar"
        className={cn(
          "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 cursor-w-resize items-center justify-center transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
          "after:absolute after:inset-y-0 after:left-1/2 after:w-px after:bg-sidebar-border hover:after:bg-sidebar-ring",
          "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:hover:bg-sidebar-accent/40",
          className
        )}
        {...props}
      >
        {state === "expanded" ? (
          <ChevronLeft className="h-3 w-3 text-sidebar-foreground/40" aria-hidden="true" />
        ) : (
          <ChevronRight className="h-3 w-3 text-sidebar-foreground/40" aria-hidden="true" />
        )}
      </button>
    )
  }
)
SidebarRail.displayName = "SidebarRail"

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex min-h-svh min-w-0 w-full flex-1 flex-col bg-background",
        "overflow-x-hidden", // Prevent horizontal overflow
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(({ defaultOpen = true, open: controlledOpen, onOpenChange, className, style, children, ...props }, ref) => {
  const [state, setState] = React.useState<"expanded" | "collapsed">(() => {
    if (typeof window !== "undefined") {
      const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
      if (cookie) {
        const value = cookie.split("=")[1]
        if (value === "collapsed") return "collapsed"
      }
    }
    return "expanded"
  })
  const [openMobile, setOpenMobile] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(`(max-width: 768px)`).matches
    }
    return false
  })

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: 768px)`)
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((prev) => !prev)
    } else {
      setState((prev) => (prev === "expanded" ? "collapsed" : "expanded"))
    }
  }, [isMobile])

  const open = controlledOpen ?? (!isMobile ? state === "expanded" : openMobile)
  const setOpen = React.useCallback((value: boolean) => {
    if (isMobile) {
      setOpenMobile(value)
    } else {
      setState(value ? "expanded" : "collapsed")
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${value ? "expanded" : "collapsed"}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    }
  }, [isMobile])

  const contextValue = React.useMemo(
    () => ({
      state,
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
    }),
    [state, open, openMobile, isMobile, setOpen, setOpenMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={cn("group/sidebar-wrapper flex min-h-svh w-full overflow-x-hidden", className)}
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            ...style,
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
})
SidebarProvider.displayName = "SidebarProvider"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { className?: string }
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-4", className)}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { className?: string }
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex shrink-0 items-center gap-2 border-t border-sidebar-border p-4", className)}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { className?: string }
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-1 overflow-y-auto px-3 pb-4", className)}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { className?: string }
>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("relative flex w-full min-w-0 flex-col p-2", className)} {...props} />
  )
})
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { className?: string; asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp
      ref={ref}
      className={cn("flex h-8 shrink-0 items-center px-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60", className)}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { className?: string }
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("space-y-1", className)} {...props} />
})
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarGroupAction = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { className?: string }
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("absolute right-3 top-3.5 flex aspect-square w-5 h-5 items-center justify-center rounded-md text-sidebar-foreground/70", className)}
      {...props}
    />
  )
})
SidebarGroupAction.displayName = "SidebarGroupAction"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul"> & { className?: string }
>(({ className, ...props }, ref) => {
  return <ul ref={ref} className={cn("flex w-full min-w-0 flex-col", className)} {...props} />
})
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li"> & { className?: string }
>(({ className, ...props }, ref) => {
  return <li ref={ref} className={cn("group/menu-item relative", className)} {...props} />
})
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
  "flex w-full items-center gap-3 overflow-hidden rounded-md px-3 py-2.5 text-sm font-medium outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-disabled disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-disabled aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-9 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-5 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "text-sidebar-foreground",
        outline: "bg-background shadow-[0_0_0_1px]_hsl(var(--sidebar-border))",
      },
      size: {
        default: "h-10 text-sm",
        sm: "h-9 text-xs",
        lg: "h-12 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    isActive?: boolean
    variant?: "default" | "outline"
    size?: "default" | "sm" | "lg"
    className?: string
    tooltip?: string
  }
>(({ asChild = false, isActive, variant = "default", size = "default", className, tooltip, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  const { state, isMobile } = useSidebar()

  const button = (
    <Comp
      ref={ref}
      data-active={isActive}
      data-state={state}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  )

  // Only show the tooltip when the sidebar is collapsed to icons on desktop;
  // when expanded the label is already visible next to the icon.
  if (!tooltip || isMobile || state !== "collapsed") {
    return button
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" align="center">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean; className?: string }
>(({ asChild = false, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  const { state } = useSidebar()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Comp
            ref={ref}
            data-sidebar="menu-action"
            className={cn(
              "absolute right-1 top-1/2 -translate-y-1/2 flex aspect-square w-5 h-5 items-center justify-center rounded-md text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:bg-sidebar-accent group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:h-0 group-data-[collapsible=icon]:p-0 [&>svg]:size-4 [&>svg]:shrink-0",
              className
            )}
            {...props}
          />
        </TooltipTrigger>
        <TooltipContent side="left" align="center">
          {props["aria-label"] || "Action"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})
SidebarMenuAction.displayName = "SidebarMenuAction"

const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { className?: string }
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-medium text-sidebar-foreground/70", className)}
      {...props}
    />
  )
})
SidebarMenuBadge.displayName = "SidebarMenuBadge"

const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul"> & { className?: string }
>(({ className, ...props }, ref) => {
  return <ul ref={ref} className={cn("mx-2 flex w-[calc(100%-0.5rem)] flex-col space-y-1", className)} {...props} />
})
SidebarMenuSub.displayName = "SidebarMenuSub"

const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li"> & { className?: string }
>(({ className, ...props }, ref) => {
  return <li ref={ref} className={cn("group/menu-item relative", className)} {...props} />
})
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

const SidebarMenuSubButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean; className?: string }
>(({ asChild = false, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  const { state } = useSidebar()

  return (
    <Comp
      ref={ref}
      data-state={state}
      className={cn(
        "flex w-full items-center gap-2 overflow-hidden rounded-md px-2 py-1.5 text-xs outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-disabled disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-9 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

export {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarGroupAction,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
  useSidebar,
}
export type { SidebarContext }
