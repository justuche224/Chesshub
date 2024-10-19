"use client";

import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import { UserButton } from "@/components/auth/UserButton";
import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import Image from "next/image";

const font = Poppins({ subsets: ["latin"], weight: ["600"] });

const Topbar = () => {
  const currentPath = usePathname();
  const isAuthPage = currentPath.startsWith("/auth/");

  if (isAuthPage) {
    return;
  }

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
        <div className="">
          <Link href="/search" className="hover:text-red-500">
            <Search />
          </Link>
        </div>
        <div className="">
          <UserButton />
        </div>
      </div>
    </nav>
  );
};

export default Topbar;
