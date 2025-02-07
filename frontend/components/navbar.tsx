import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { RainbowButton } from "./ui/rainbow-button";
import { NavbarDock } from "./ui/FloatingDock";

const Navbar = ({ onClickHandler }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/home" },
    { name: "My Agents", href: "/my-agents" },
    { name: "Create Agent", href: "/create-agent" },
    { name: "Profile", href: "/profile" },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/75 border-b border-gray-200/20 shadow-lg supports-[backdrop-filter]:bg-white/75">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                KoVa
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <NavbarDock />

          {/* Sign In Button */}
          <div className="hidden md:block">
            <RainbowButton onClick={onClickHandler}>Sign in</RainbowButton>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 backdrop-blur-sm"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? "block" : "hidden"} md:hidden shadow-lg`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 backdrop-blur-md bg-white/75 supports-[backdrop-filter]:bg-white/75">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50/50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="w-[150px]">
            <RainbowButton className="w-[150px]">Sign in</RainbowButton>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
