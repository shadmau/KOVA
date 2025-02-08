import React from "react";
import {
  Home,
  User,
  BarChart2,
  Shield,
  CreditCard,
  Settings,
  Search,
  Menu,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
  subItems?: Array<{
    label: string;
    href: string;
  }>;
}

interface NavItemProps extends MenuItem {
  className?: string;
}

interface AppLayoutProps {
  children: React.ReactNode;
}

interface Breadcrumb {
  href: string;
  label: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = React.useState<boolean>(false);
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    { icon: Home, label: "Home", href: "/" },
    { icon: User, label: "Create Agent", href: "/createAgent" },
    { icon: BarChart2, label: "Dashboard", href: "/dashboard" },
    { icon: Shield, label: "Agents", href: "/agents" },
    { icon: CreditCard, label: "Payment", href: "/payment" },
    { icon: Settings, label: "Team Settings", href: "/settings" },
  ];

  const getBreadcrumbs = (): Breadcrumb[] => {
    const paths = pathname.split("/").filter((p) => p);
    return paths.map((path, index) => {
      const href = "/" + paths.slice(0, index + 1).join("/");
      const label = path.charAt(0).toUpperCase() + path.slice(1);
      return { href, label };
    });
  };

  const NavItem: React.FC<NavItemProps> = ({
    icon: Icon,
    label,
    href,
    subItems,
    className,
  }) => {
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    const isActive = pathname === href || pathname.startsWith(href + "/");
    const subItemActive = subItems?.some((item) => pathname === item.href);

    return (
      <div className={className}>
        <Link
          href={href}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${
            isActive || subItemActive
              ? "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400"
              : "text-gray-500 dark:text-gray-400"
          }`}
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
            if (subItems) {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
        >
          <Icon className="h-4 w-4" />
          <span className="text-sm font-medium">{label}</span>
        </Link>
        {subItems && isOpen && (
          <div className="ml-6 mt-1 space-y-1">
            {subItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  pathname === item.href
                    ? "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  const Breadcrumbs: React.FC = () => {
    const breadcrumbs = getBreadcrumbs();
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link
          href="/"
          className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <Home className="h-4 w-4" />
        </Link>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.href}>
            <span className="text-gray-400">/</span>
            <Link
              href={crumb.href}
              className={`hover:text-gray-900 dark:hover:text-gray-100 ${
                index === breadcrumbs.length - 1
                  ? "text-gray-900 dark:text-gray-100"
                  : ""
              }`}
            >
              {crumb.label}
            </Link>
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b px-4">
            <Link href="/" className="flex items-center gap-2 ">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                KoVa
              </span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full bg-white pl-8 dark:bg-gray-950"
                />
              </div>
              <div className="my-4 space-y-1">
                {menuItems.map((item) => (
                  <NavItem key={item.href} {...item} />
                ))}
              </div>
            </nav>
          </div>
        </div>
      </aside>

      {/* Mobile Trigger */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-full flex-col">
            <div className="flex h-14 items-center border-b px-4">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <span className="text-xl">UnifiedHR</span>
              </Link>
            </div>
            <nav className="grid flex-1 items-start px-4 text-sm font-medium">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full bg-white pl-8 dark:bg-gray-950"
                />
              </div>
              <div className="my-4 space-y-1">
                {menuItems.map((item) => (
                  <NavItem key={item.href} {...item} />
                ))}
              </div>
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1">
        <header className="flex h-14 items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
          <div className="flex flex-1 items-center gap-4">
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
            </Button>
            <Breadcrumbs />
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
