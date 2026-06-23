import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { Sun, Moon, Fish, List, X, ArrowRight, Waves, Code } from "@phosphor-icons/react";
import { useState } from "react";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/docs", label: "Docs" },
  { to: "/about", label: "About" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="ocean-shell min-h-screen flex flex-col bg-background">
      <div className="noise-overlay" />
      <header className="fixed inset-x-0 top-0 z-50 w-full px-3 py-3">
        <div className="container">
          <div className="glass-panel flex h-16 items-center justify-between rounded-2xl px-3.5 md:px-5">
          <Link
            to="/"
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#06283D] text-white shadow-[0_14px_36px_rgba(6,40,61,0.24)] transition-transform group-hover:-translate-y-0.5 dark:bg-[#47B5FF] dark:text-[#06283D]">
              <Fish size={18} weight="fill" />
            </div>
            <div className="leading-none">
              <span className="block text-base font-semibold tracking-tight">IkanHub</span>
              <span className="hidden text-[11px] font-medium text-muted-foreground sm:block">
                Fish images and metadata
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 rounded-2xl border border-border/50 bg-muted/45 p-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${
                  location.pathname === link.to
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <Button asChild size="sm" className="hidden rounded-xl md:inline-flex">
              <Link to="/docs">
                <Code size={14} weight="bold" className="mr-1.5" />
                API
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-xl"
            >
              {theme === "dark" ? (
                <Sun size={18} weight="bold" />
              ) : (
                <Moon size={18} weight="bold" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-xl"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={18} /> : <List size={18} />}
            </Button>
          </div>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="container md:hidden">
            <div className="glass-panel mt-2 flex flex-col gap-1 rounded-2xl p-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                    location.pathname === link.to
                      ? "text-foreground bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10 flex-1">{children}</main>

      <footer className="relative z-10 border-t border-border/50 bg-surface-subtle/80 overflow-hidden">
        <div className="absolute inset-0 bg-ocean-pattern opacity-70 pointer-events-none" />
        <div className="container py-12 md:py-16">
          <div className="relative grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[linear-gradient(135deg,#06283D,#1363DF_55%,#47B5FF)] text-white">
                  <Fish size={16} weight="fill" />
                </div>
                <span>IkanHub</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                The largest fish image and fish metadata platform. Discover fish. Build with data.
              </p>
              <Link
                to="/docs"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-foreground transition-colors"
              >
                Start with the API
                <ArrowRight size={14} weight="bold" />
              </Link>
            </div>

            {/* Links */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Product
              </h4>
              <div className="flex flex-col gap-2">
                {[
                  { to: "/explore", label: "Explore" },
                  { to: "/docs", label: "API Docs" },
                  { to: "/about", label: "About" },
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Resources
              </h4>
              <div className="flex flex-col gap-2">
                <a
                  href="https://fishbase.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  FishBase
                </a>
                <Link
                  to="/docs"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Documentation
                </Link>
                <Link
                  to="/explore"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Image collection
                </Link>
              </div>
            </div>
          </div>

          <div className="relative mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p className="inline-flex items-center gap-2">
              <Waves size={14} className="text-primary" />
              Not affiliated with FishBase. Images are used with attribution.
            </p>
            <p>
              Ocean photography for software builders.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
