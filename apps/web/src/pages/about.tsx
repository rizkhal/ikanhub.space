import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowSquareOut, ShieldCheck, Code, Image } from "@phosphor-icons/react";

export default function About() {
  return (
    <div className="container py-12 md:py-16 max-w-3xl space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">About Ikanhub</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Ikanhub is a free placeholder image service for developers, providing
          beautiful fish photos through simple URLs.
        </p>
      </div>

      {/* What is Ikanhub */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">What is Ikanhub?</h2>
        <p className="text-muted-foreground leading-relaxed">
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
        <p className="text-muted-foreground leading-relaxed">
          The name Ikanhub combines "Ikan" (fish in Indonesian and Malay) with
          "hub", reflecting our mission to be the central hub for fish imagery
          in development workflows.
        </p>
      </section>

      {/* Data Sources */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Data Sources</h2>
        <p className="text-muted-foreground leading-relaxed">
          Our primary image source is the{" "}
          <a
            href="https://fishbase.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            FishBase
          </a>{" "}
          Best Photos collection, a comprehensive database of fish photographs
          curated by biologists and ichthyologists worldwide. We curate these
          images and make them accessible through the API.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Each image preserves its original metadata, including the scientific
          name, author, locality, and license information. We do
          not claim ownership of these images.
        </p>
      </section>

      {/* Attribution */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Attribution and Licensing</h2>
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3">
          <p className="text-sm leading-relaxed">
            <strong>Important:</strong> Images served through Ikanhub may be
            licensed under various Creative Commons or other open licenses.
            Always check the <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">license</code> field in the
            metadata JSON before using images in your projects, especially for
            commercial purposes.
          </p>
          <p className="text-sm leading-relaxed">
            Most FishBase images are licensed under{" "}
            <strong>CC BY-NC 3.0</strong> (Creative Commons
            Attribution-NonCommercial 3.0), which means:
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5 text-muted-foreground">
            <li>You must give appropriate credit to the original author.</li>
            <li>You may not use the material for commercial purposes.</li>
            <li>Some images may have different license terms. Always verify.</li>
          </ul>
        </div>
      </section>

      {/* What you can do */}
      <section className="space-y-4">
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
              icon: ShieldCheck,
              title: "Educational projects",
              desc: "Showcase fish biodiversity with properly attributed imagery.",
            },
            {
              icon: ArrowSquareOut,
              title: "API integrations",
              desc: "Simple REST endpoints for any language or framework.",
            },
          ].map((feature) => (
            <Card key={feature.title}>
              <CardContent className="p-4 space-y-2">
                <feature.icon size={18} weight="bold" className="text-primary" />
                <h3 className="font-semibold text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Technical */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Technical Details</h2>
        <Card>
          <CardContent className="p-6 space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              <strong>Image processing:</strong> All images are resized on
              demand using Sharp. Images are output as JPEG at quality 85.
            </p>
            <p>
              <strong>Caching:</strong> Resized images are cached on disk for
              fast subsequent requests. Cache headers are set to 24 hours.
            </p>
            <p>
              <strong>Validation:</strong> Dimensions are validated server-side.
              Width and height must be between 1 and 3000 pixels.
            </p>
            <p>
              <strong>No tracking:</strong> We only log anonymous request data
              for analytics (hashed IP, endpoint, user-agent). No personal data
              is stored.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Ready to get started?</h2>
          <p className="text-primary-foreground/80">
            Browse the collection or dive straight into the API.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button asChild variant="secondary">
              <Link to="/docs">View API docs</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link to="/explore">Browse images</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
