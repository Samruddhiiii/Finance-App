import React from "react";
import { Button } from "./ui/button";
import { PenBox, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { checkUser } from "@/lib/checkUser";
import Image from "next/image";
import PlayToggle from "./ui/PlayToggle";

const Header = async () => {
  await checkUser();

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <nav className="container flex items-center justify-between px-4 py-4 mx-auto">
        <Link href="/">
          <Image
            src={"/logo.png"}
            alt="Welth Logo"
            width={200}
            height={60}
            className="object-contain w-auto h-12"
          />
        </Link>

        {/* Navigation Links - Different for signed in/out users */}
        <div className="items-center hidden space-x-8 md:flex">
          <SignedOut>
            <a href="#features" className="text-gray-600 hover:text-blue-600">
              Features
            </a>
            <a
              href="#testimonials"
              className="text-gray-600 hover:text-blue-600"
            >
              Testimonials
            </a>
          </SignedOut>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <SignedIn>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
            >
              <Button variant="outline">
                <LayoutDashboard size={18} />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>
            <a href="/transaction/create">
              <Button className="flex items-center gap-2">
                <PenBox size={18} />
                <span className="hidden md:inline">Add Transaction</span>
              </Button>
            </a>
          </SignedIn>
          <SignedOut>
            <SignInButton forceRedirectUrl="/">
              <PlayToggle></PlayToggle>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
