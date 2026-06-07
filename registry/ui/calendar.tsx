"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, useDayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

/**
 * shadcn-style wrapper around react-day-picker v10. Modifiers like `selected`,
 * `range_start`, `range_middle`, `range_end` are added to the day button as CSS
 * classes via the `classNames` prop — NOT as `data-*` attributes — so we style
 * them by class name.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-3",
        // Hide the library's built-in nav — we render arrows inside each
        // MonthCaption instead so the left/right buttons sit symmetrically next
        // to their respective month captions.
        nav: "hidden",
        month_caption: "h-9",
        caption_label: "text-sm font-medium",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.75rem]",
        week: "flex w-full mt-1",
        day: "relative size-8 p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day_button:
          "size-8 inline-flex items-center justify-center rounded-md font-normal hover:bg-muted/60 hover:text-foreground",
        selected: "bg-accent text-foreground",
        range_start:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary/90 rounded-l-md",
        range_end:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary/90 rounded-r-md",
        range_middle: "rounded-none",
        today: "[&>button]:ring-1 [&>button]:ring-ring/30 [&>button]:ring-inset",
        outside: "text-muted-foreground/50",
        disabled: "text-muted-foreground/40 [&>button]:cursor-not-allowed",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        MonthCaption: SymmetricMonthCaption,
      }}
      {...props}
    />
  )
}

/**
 * Renders the month caption with a navigation arrow on the side that "owns"
 * navigation: prev arrow on the first month, next arrow on the last. Middle
 * months (if any) just render the label.
 */
function SymmetricMonthCaption({
  calendarMonth,
  displayIndex,
}: {
  calendarMonth: { date: Date }
  displayIndex: number
}) {
  const { months, goToMonth, previousMonth, nextMonth } = useDayPicker()
  const isFirst = displayIndex === 0
  const isLast = displayIndex === months.length - 1
  const label = calendarMonth.date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="flex h-9 items-center justify-between gap-2">
      {isFirst ? (
        <NavButton
          aria-label="Go to previous month"
          disabled={!previousMonth}
          onClick={() => previousMonth && goToMonth(previousMonth)}
        >
          <ChevronLeft className="size-4" />
        </NavButton>
      ) : (
        <span aria-hidden className="size-7" />
      )}
      <span className="text-sm font-medium">{label}</span>
      {isLast ? (
        <NavButton
          aria-label="Go to next month"
          disabled={!nextMonth}
          onClick={() => nextMonth && goToMonth(nextMonth)}
        >
          <ChevronRight className="size-4" />
        </NavButton>
      ) : (
        <span aria-hidden className="size-7" />
      )}
    </div>
  )
}

function NavButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-md border bg-transparent text-muted-foreground transition hover:bg-muted/60 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export { Calendar }
