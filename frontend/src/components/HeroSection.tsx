import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--accent)),transparent_70%)]" />
      <div className="container mx-auto px-4 text-center">
        <h1 className="animate-fade-in-up text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Student Registration Portal
        </h1>
        <p className="mx-auto mt-6 max-w-2xl animate-fade-in-up text-lg text-muted-foreground" style={{ animationDelay: "0.15s" }}>
          Register students quickly with photo capture and secure details
        </p>
        <div className="mt-10 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <Link to="/register">
            <Button size="lg" className="gap-2 px-8 text-base">
              Register Now
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
