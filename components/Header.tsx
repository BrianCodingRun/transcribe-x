/**
 * v0 by Vercel.
 * @see https://v0.dev/t/a8QWcxG86ic
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
"use client"
import Link from "next/link"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import xLogo from "@/assets/xLogoApp.png";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { useEffect, useState } from "react";

const navLinks = [
  { name: "Accueil", href: "/" },
  { name: "A propos", href: "/about" },
]

export const Header = () => {
  const [header, setHeader] = useState(false);

  const handleScroll = () => {
    if (window.scrollY >= 0) {
      setHeader(true);
    } else {
      setHeader(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    };
  }, []);

  return (
    <header className={`sticky top-0 left-0 right-0 z-50 max-w-5xl w-full m-auto bg-background/60 backdrop-blur-lg`}>
      <div className="container flex h-20 items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <Link href="/" prefetch={false} className="flex items-center gap-2">
              <img src={xLogo.src} alt="TranscribeX" className="h-6 w-6 mix-blend-difference" />
              TranscribeX
            </Link>
            <div className="grid gap-2 py-6">
              {
                navLinks.map((link) => (
                  <Link key={link.name} href={link.href} className="flex w-full items-center py-2 text-lg font-light" prefetch={false}>
                    {link.name}
                  </Link>
                ))
              }
            </div>
          </SheetContent>
        </Sheet>
        <Sheet>
          <Link href="/" className="hidden lg:flex items-center gap-2 " prefetch={false}>
            <img src={xLogo.src} alt="TranscribeX" className="h-8 w-8 mix-blend-difference" />
            TranscribeX
          </Link>
          <nav className="ml-auto hidden lg:flex gap-4 sm:gap-6">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-sm hover:underline underline-offset-4" prefetch={false}>
                {link.name}
              </Link>
            ))}
          </nav>
          {/* THEME SWITCHER */}
          <div className="ml-auto flex gap-2 items-center">
            <ThemeSwitcher />
          </div>
        </Sheet>
      </div>
    </header>
  )
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}