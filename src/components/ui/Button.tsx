import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  `
  group/button
  inline-flex
  shrink-0
  items-center
  justify-center
  whitespace-nowrap
  rounded-2xl
  border
  border-transparent
  text-sm
  font-semibold
  transition-all
  duration-300
  outline-none
  select-none

  focus-visible:ring-4
  focus-visible:ring-[#B348FE]/20

  active:scale-[0.98]

  disabled:pointer-events-none
  disabled:opacity-50

  [&_svg]:pointer-events-none
  [&_svg]:shrink-0
  [&_svg:not([class*='size-'])]:size-4
  `,
  {
    variants: {
      variant: {
        default: `
          bg-[#B348FE]
          text-white
          hover:bg-[#9E2FFF]
          hover:shadow-[0_10px_30px_rgba(179,72,254,.35)]
        `,

        outline: `
          border-gray-200
          bg-white
          text-gray-700
          hover:border-[#B348FE]
          hover:text-[#B348FE]
          hover:bg-[#F6EEFF]

          dark:bg-[#111111]
          dark:border-[#2A2A2A]
          dark:text-gray-200
          dark:hover:bg-[#1A1A1A]
        `,

        secondary: `
          bg-[#F6EEFF]
          text-[#B348FE]
          hover:bg-[#EEDBFF]

          dark:bg-[#1F1F1F]
          dark:text-[#B348FE]
          dark:hover:bg-[#2B103D]
        `,

        ghost: `
          bg-transparent
          text-gray-700
          hover:bg-[#F6EEFF]
          hover:text-[#B348FE]

          dark:text-gray-200
          dark:hover:bg-[#1A1A1A]
        `,

        destructive: `
          bg-red-600
          text-white
          hover:bg-red-700
        `,

        success: `
          bg-emerald-600
          text-white
          hover:bg-emerald-700
        `,

        link: `
          bg-transparent
          text-[#B348FE]
          underline-offset-4
          hover:underline
        `,
      },

      size: {
        default: "h-10 px-5 gap-2",

        xs: "h-7 px-3 text-xs gap-1",

        sm: "h-9 px-4 text-sm gap-1.5",

        lg: "h-12 px-6 text-base gap-2",

        icon: "size-10",

        "icon-xs": "size-7",

        "icon-sm": "size-9",

        "icon-lg": "size-12",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };