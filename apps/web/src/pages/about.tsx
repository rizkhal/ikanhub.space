import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Image, Fish, Code, Globe, BookOpenText, ShieldCheck } from "@phosphor-icons/react";

export default function About() {
  return (
    <div className="container py-12 md:py-16 max-w-4xl space-y-16">
      {/* Header */}
      <section className="max-w-3xl">
        <div className="flex items-center gap-2 mb-4">
          <Fish size={20} weight="bold" className="text-primary" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            About
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          About Ikanhub
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Ikanhub is a free placeholder image service for developers, providing
          beautiful fish photos through simple URLs. We believe fish imagery
          should be accessible to everyone building on the web.
        </p>
      </section>

      {/* What is Ikanhub */}
      <section className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">What is Ikanhub?</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Inspired by{" "}
              <a
                href="https://picsum.photos"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Picsum Photos
              </a>
              , Ikanhub provides a developer-friendly API for fish placeholder
              images. Specify the dimensions in the URL and get a perfectly
              resized, center-cropped JPEG image. No registration, no API keys.
            </p>
            <p>
              The name Ikanhub combines "Ikan" (fish in Indonesian and Malay) with
              "hub", reflecting our mission to be the central hub for fish imagery
              in development workflows.
            </p>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden bg-muted border border-border/50 aspect-[4/3]">
            <img
              src={`${import.meta.env.VITE_API_URL || ""}/fish/600/450?t=about`}
              alt="Random fish from the collection"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Data Sources</h2>
        <Card className="border-border/50 shadow-card-glow">
          <CardContent className="p-6 md:p-8 space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Our primary image source is the{" "}
              <a
                href="https://fishbase.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                FishBase
              </a>{" "}
              Best Photos collection, a comprehensive database of fish photographs
              curated by biologists and ichthyologists worldwide. We curate these
              images and make them accessible through the API.
            </p>
            <p>
              Each image preserves its original metadata, including the scientific
              name, author, locality, and license information. We do
              not claim ownership of these images.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Attribution and Licensing */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Attribution and Licensing</h2>
        <Card className="border-primary/20 bg-primary/5 border-border/50 shadow-card-glow">
          <CardContent className="p-6 md:p-8 space-y-4">
            <div className="flex items-start gap-3">
              <ShieldCheck size={20} weight="bold" className="text-primary shrink-0 mt-0.5" />
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  <strong>Important:</strong> Images served through Ikanhub may be
                  licensed under various Creative Commons or other open licenses.
                  Always check the <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">license</code> field in the
                  metadata JSON before using images in your projects, especially for
                  commercial purposes.
                </p>
                <p>
                  Most FishBase images are licensed under{" "}
                  <strong>CC BY-NC 3.0</strong> (Creative Commons
                  Attribution-NonCommercial 3.0), which means:
                </p>
                <ul className="space-y-1.5 pl-5 list-disc">
                  <li>You must give appropriate credit to the original author.</li>
                  <li>You may not use the material for commercial purposes.</li>
                  <li>Some images may have different license terms. Always verify.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* What you can do */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">What you can do</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              icon: Image,
              title: "Use in prototypes",
              desc: "Quick placeholder images for mockups and wireframes.",
            },
            {
              icon: Code,
              title: "Build metadata-rich apps",
              desc: "Access species, author, and license data via JSON endpoints.",
            },
            {
              icon: BookOpenText,
              title: "Educational projects",
              desc: "Showcase fish biodiversity with properly attributed imagery.",
            },
            {
              icon: Globe,
              title: "API integrations",
              desc: "Simple REST endpoints for any language or framework.",
            },
          ].map((feature) => (
            <Card key={feature.title} className="border-border/50 shadow-card-glow card-elevate">
              <CardContent className="p-5 space-y-3">
                <div className="rounded-xl bg-primary/10 w-10 h-10 flex items-center justify-center">
                  <feature.icon size={18} weight="bold" className="text-primary" />
                </div>
                <h3 className="font-semibold text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Technical Details */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Technical Details</h2>
        <Card className="border-border/50 shadow-card-glow">
          <CardContent className="p-6 md:p-8 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-surface-subtle border border-border/30 p-4">
                <h4 className="font-semibold text-foreground mb-1">Image processing</h4>
                <p>All images are resized on demand using Sharp. Images are output as JPEG at quality 85.</p>
              </div>
              <div className="rounded-xl bg-surface-subtle border border-border/30 p-4">
                <h4 className="font-semibold text-foreground mb-1">Caching</h4>
                <p>Resized images are cached on disk for fast subsequent requests. Cache headers are set to 24 hours.</p>
              </div>
              <div className="rounded-xl bg-surface-subtle border border-border/30 p-4">
                <h4 className="font-semibold text-foreground mb-1">Validation</h4>
                <p>Dimensions are validated server-side. Width and height must be between 1 and 3000 pixels.</p>
              </div>
              <div className="rounded-xl bg-surface-subtle border border-border/30 p-4">
                <h4 className="font-semibold text-foreground mb-1">Privacy</h4>
                <p>We only log anonymous request data for analytics. No personal data is stored.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <Card className="relative overflow-hidden border-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
        <div className="relative z-10 p-10 md:p-14 text-center space-y-5">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Ready to get started?
          </h2>
          <p className="text-white/80 max-w-md mx-auto leading-relaxed">
            Browse the collection or dive straight into the API.
          </p>
          <div className="flex items-center justify-center gap-3 pt-1">
            <Button asChild variant="secondary" className="rounded-xl bg-white text-primary hover:bg-white/90">
              <Link to="/docs">
                View API docs
                <ArrowRight size={16} weight="bold" className="ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/20 text-white hover:bg-white/10"
            >
              <Link to="/explore">Browse images</Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
