import React from "react";
import {
  Home,
  User,
  BarChart2,
  Shield,
  Menu,
  Copy,
  ExternalLink,
  Power,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAccount, useDisconnect, useEnsName } from "wagmi";
import WalletConnectionManager from "./WalletConnectionManager";
import { RoomProvider } from "@/context/room";

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
const WalletStatus = () => {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { disconnect } = useDisconnect();
  const [copied, setCopied] = React.useState(false);

  // Don't render if not connected
  if (!isConnected || !address) return null;

  const shortenAddress = (addr: string) => {
    return `${addr?.slice(0, 6)}...${addr?.slice(-4)}`;
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address as string);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <div className="relative flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-50 via-purple-100 to-purple-50 px-4 py-1 shadow-lg hover:shadow-xl transition-all duration-300 dark:from-purple-900/30 dark:via-purple-800/30 dark:to-purple-900/30 border border-purple-200/50 dark:border-purple-700/30 backdrop-blur-sm">
          <div className="relative">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <div className="absolute inset-0 h-2 w-2 rounded-full bg-green-400 animate-ping opacity-75" />
          </div>
          <span className="text-sm font-medium bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent dark:from-purple-300 dark:to-purple-400">
            {ensName || shortenAddress(address)}
          </span>
          <div className="flex gap-1 ml-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-white/80 hover:shadow-md transition-all duration-200 dark:hover:bg-purple-800/50"
                  onClick={copyAddress}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-purple-50 border border-purple-100 dark:bg-purple-900 dark:border-purple-800">
                {copied ? "Copied!" : "Copy address"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-white/80 hover:shadow-md transition-all duration-200 dark:hover:bg-purple-800/50"
                  onClick={() =>
                    window.open(
                      `https://sepolia.basescan.org/address/${address}`,
                      "_blank"
                    )
                  }
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-purple-50 border border-purple-100 dark:bg-purple-900 dark:border-purple-800">
                View on Etherscan
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-white/80 hover:shadow-md transition-all duration-200 dark:hover:bg-purple-800/50"
                  onClick={() => disconnect()}
                >
                  <Power className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-purple-50 border border-purple-100 dark:bg-purple-900 dark:border-purple-800">
                Disconnect
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = React.useState<boolean>(false);
  const pathname = usePathname();
  const { address, isConnected, status } = useAccount();
  const [isReady, setIsReady] = React.useState(false);
  const menuItems: MenuItem[] = [
    { icon: Home, label: "Home", href: "/" },
    { icon: User, label: "Create Agent", href: "/createAgent" },
    { icon: BarChart2, label: "Profile", href: "/profile" },
    { icon: Shield, label: "Agents", href: "/agents" },
  ];

   React.useEffect(() => {
     if (status !== "connecting") {
       setIsReady(true);
     }
   }, [status]);
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
    <RoomProvider>
      <div className="flex min-h-screen">
        <WalletConnectionManager
          shouldShowConnectDialog={!isConnected && !address && isReady}
        />
        {/* Sidebar - Desktop */}
        <aside className="hidden w-64 border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center border-b px-4">
              <Link href="/" className="flex items-center gap-2 pl-4">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  KOVA
                </span>
              </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid items-start px-4 text-sm font-medium">
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
                <Link
                  href="/"
                  className="flex items-center gap-2 font-semibold"
                >
                  <span className="text-xl">KOVA</span>
                </Link>
              </div>
              <nav className="grid flex-1 items-start px-4 text-sm font-medium">
                <div className=" space-y-1">
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
          <header className="flex h-16 items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
            <div className="flex flex-1 items-center gap-4">
              <Breadcrumbs />
            </div>
            {isReady && <WalletStatus />}
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </RoomProvider>
  );
};

export default AppLayout;
