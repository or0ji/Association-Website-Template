"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuItem, Settings } from "@/lib/api";

interface HeaderProps {
  menus: MenuItem[];
  settings: Settings;
}

export function Header({ menus, settings }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const getMenuLink = (menu: MenuItem): string => {
    if (menu.slug === "home") return "/";
    if (menu.type === "page") return `/page/${menu.slug}`;
    if (menu.type === "category") return `/category/${menu.slug}`;
    return "#";
  };

  const isActive = (menu: MenuItem): boolean => {
    const link = getMenuLink(menu);
    if (link === "/") return pathname === "/";
    return pathname.startsWith(link);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-10 text-sm">
            <div className="flex items-center gap-4">
              <span>欢迎访问{settings.site_name || "协会官网"}</span>
            </div>
            {settings.site_phone && (
              <div className="hidden md:flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>服务热线：{settings.site_phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">电</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">
                {settings.site_name || "山西省电力工程企业协会"}
              </h1>
              <p className="text-xs text-gray-500">
                Shanxi Power Engineering Enterprise Association
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center">
            {menus.map((menu) => (
              <div
                key={menu.id}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(menu.id)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={getMenuLink(menu)}
                  className={cn(
                    "flex items-center gap-1 px-5 py-2 text-base font-medium transition-colors",
                    isActive(menu)
                      ? "text-primary"
                      : "text-gray-700 hover:text-primary"
                  )}
                >
                  {menu.name}
                  {menu.children && menu.children.length > 0 && (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Link>

                {/* Dropdown */}
                {menu.children && menu.children.length > 0 && (
                  <div
                    className={cn(
                      "absolute top-full left-0 w-48 bg-white shadow-lg rounded-b-lg py-2 transition-all duration-200",
                      activeDropdown === menu.id
                        ? "opacity-100 visible"
                        : "opacity-0 invisible"
                    )}
                  >
                    {menu.children.map((child) => (
                      <Link
                        key={child.id}
                        href={getMenuLink(child)}
                        className={cn(
                          "block px-4 py-2 text-sm transition-colors",
                          isActive(child)
                            ? "text-primary bg-primary/5"
                            : "text-gray-600 hover:text-primary hover:bg-primary/5"
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Active indicator */}
                {isActive(menu) && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
              </div>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t">
          <nav className="container mx-auto px-4 py-4">
            {menus.map((menu) => (
              <div key={menu.id} className="border-b border-gray-100 last:border-0">
                <Link
                  href={getMenuLink(menu)}
                  className={cn(
                    "block py-3 font-medium",
                    isActive(menu) ? "text-primary" : "text-gray-700"
                  )}
                >
                  {menu.name}
                </Link>
                {menu.children && menu.children.length > 0 && (
                  <div className="pl-4 pb-2">
                    {menu.children.map((child) => (
                      <Link
                        key={child.id}
                        href={getMenuLink(child)}
                        className={cn(
                          "block py-2 text-sm",
                          isActive(child) ? "text-primary" : "text-gray-500"
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

