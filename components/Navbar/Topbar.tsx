"use client";

import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import { UserButton } from "@/components/auth/UserButton";
import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const font = Poppins({ subsets: ["latin"], weight: ["600"] });

const Topbar = () => {
  const currentPath = usePathname();
  const isAuthPage = currentPath.startsWith("/auth/");

  if (isAuthPage) {
    return;
  }
  const { setTheme } = useTheme();

  return (
    <nav
      aria-label="Top Bar"
      className="
              w-full 
              h-12 
              sticky
              top-0
              flex
              px-5
              items-center
              justify-between
              dark:border-b-white
              bg-white 
              dark:bg-black 
              text-black 
              dark:text-white
              border-b
              border-b-black
              z-[998]
            "
    >
      <div className="">
        <Link
          href="/"
          className={cn(
            "text-3xl font-semibold flex justify-center items-center gap-x-2",
            font.className
          )}
        >
          <Image
            src="https://i.postimg.cc/MpMMYSTX/chesshub.png"
            width={44}
            height={44}
            alt="loo"
          />
          <span>CHESSHUB</span>
        </Link>
      </div>
      <div className="flex gap-4 items-center">
        {/* <div className="">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div> */}
        <div className="">
          {/* <Link href="/search" className="hover:text-red-500">
            <Search />
          </Link> */}
        </div>
        <div className="">
          <UserButton />
        </div>
      </div>
    </nav>
  );
};

export default Topbar;
