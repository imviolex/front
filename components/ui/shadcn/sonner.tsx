"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme()
    const [position, setPosition] = useState<ToasterProps["position"]>("top-center")

    useEffect(() => {
        const updatePosition = () => {
            if (window.innerWidth < 768) {
                setPosition("top-center")
            } else {
                setPosition("top-right")
            }
        }

        // اجرای مقدار اولیه
        updatePosition()

        // تنظیم `resize` event listener
        window.addEventListener("resize", updatePosition)
        return () => window.removeEventListener("resize", updatePosition)
    }, [])

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            className="toaster group"
            position={position}
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg font-dana",
                    description: "group-[.toast]:text-muted-foreground font-dana",
                    actionButton:
                        "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                    cancelButton:
                        "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                    error: "group-[.toaster]:!bg-[hsl(0,66%,44%)] group-[.toaster]:!text-[hsl(0,0%,100%)] group-[.toaster]:border-none dark:group-[.toaster]:!bg-[hsl(1,64%,30%)] dark:group-[.toaster]:!text-[hsl(0,0%,100%)] dark:group-[.toaster]:border-none",
                    success: "group-[.toaster]:!bg-[hsl(166,56%,33%)] group-[.toaster]:!text-[hsl(0,0%,100%)] group-[.toaster]:border-none",

                },
                style: {
                    textAlign: "right",

                }
            }}
            {...props}
        />
    )
}

export { Toaster }