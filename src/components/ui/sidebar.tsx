"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { PanelLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
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

const sidebarVariants = cva(
  "group/sidebar-wrapper flex min-h-svh flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-linear",
  {
    variants: {
      side: {
        left: "left-0",
        right: "right-0",
      },
      variant: {
        sidebar: "fixed inset-y-0 z-10 w-(--sidebar-width) md:flex",
        floating: "fixed inset-y-0 z-10 w-(--sidebar-width) md:flex rounded-lg border border-sidebar-border shadow-lg",
        inset: "w-(--sidebar-width) flex-none",
      },
      collapsible: {
        offcanvas: "",
        icon: "",
        none: "w-(--sidebar-width) min-w-(--sidebar-width)",
      },
    },
    defaultVariants: {
      side: "left",
      variant: "sidebar",
      collapsible: "offcanvas",
    },
  }
)

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>((props, ref) => {
  const { side = "left", variant = "sidebar", collapsible = "offcanvas", className, style, children, ...rest } = props
  const { state } = useSidebar()

  return (
    <TooltipProvider delayDuration={0}>
      <div
        ref={ref}
        className={cn(sidebarVariants({ side, variant, collapsible }), className)}
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            ...style,
          } as React.CSSProperties
        }
        data-side={side}
        data-variant={variant}
        data-collapsible={collapsible}
        data-state={state}
        {...rest}
      >
        {children}
        <SidebarRail />
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={ref}
              onClick={toggleSidebar}
              variant="ghost"
              size="icon"
              className={cn(
                "relative flex h-full w-3 items-center justify-center transition-all ease-linear focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-sidebar",
                className
              )}
              {...props}
            >
              {state === "expanded" ? (
                <ChevronLeft className="h-4 w-4 text-muted-foreground transition-transform" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" align="center">
            Toggle Sidebar
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
)
SidebarRail.displayName = "SidebarRail"

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn("relative flex min-h-svh flex-1 flex-col bg-background", className)}
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
        className={cn("group/sidebar-wrapper flex min-h-svh", className)}
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
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className="w-(--sidebar-width-mobile) p-0"
            side="left"
          >
            <div className="flex h-full flex-col">
              {React.Children.map(children, (child) => {
                if (React.isValidElement(child) && (child.type as any).displayName === "SidebarContent") {
                  return React.cloneElement(child as React.ReactElement<{ className?: string }>, { className: "flex-1 overflow-y-auto" })
                }
                return child
              })}
            </div>
          </SheetContent>
        </Sheet>
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
  }
>(({ asChild = false, isActive, variant = "default", size = "default", className, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  const { state } = useSidebar()

  return (
    <Comp
      ref={ref}
      data-active={isActive}
      data-state={state}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
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