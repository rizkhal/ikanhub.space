import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { Sun, Moon } from "@phosphor-icons/react";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/docs", label: "Docs" },
  { to: "/explore", label: "Explore" },
  { to: "/about", label: "About" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-bold text-xl tracking-tight"
          >
            <svg
              viewBox="0 0 64 64"
              className="h-7 w-7"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="32" cy="32" r="30" fill="currentColor" className="text-primary" />
              <path
                d="M16 32c0-4 2-8 6-10s8-3 12-1c4-2 8-1 12 1s6 6 6 10-2 8-6 10-8 3-12 1c-4 2-8 1-12-1s-6-6-6-10z"
                fill="currentColor"
                className="text-primary-foreground"
                opacity="0.8"
              />
              <circle cx="44" cy="28" r="2" fill="#fff" opacity="0.9" />
            </svg>
            ikanhub
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.to
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? (
                <Sun size={18} weight="bold" />
              ) : (
                <Moon size={18} weight="bold" />
              )}
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 64 64"
              className="h-5 w-5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="32" cy="32" r="30" fill="currentColor" className="text-primary" />
              <path
                d="M16 32c0-4 2-8 6-10s8-3 12-1c4-2 8-1 12 1s6 6 6 10-2 8-6 10-8 3-12 1c-4 2-8 1-12-1s-6-6-6-10z"
                fill="currentColor"
                className="text-primary-foreground"
                opacity="0.8"
              />
            </svg>
            <span className="font-medium">ikanhub</span>
          </div>
          <p>
            Fish placeholder images for developers. Not affiliated with FishBase.
          </p>
          <div className="flex gap-4">
            <Link to="/docs" className="hover:text-foreground transition-colors">
              Docs
            </Link>
            <Link to="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
