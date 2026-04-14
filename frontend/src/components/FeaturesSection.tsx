import { ClipboardList, Camera, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: ClipboardList,
    title: "Easy Registration",
    description: "Register students in seconds with a streamlined, intuitive form.",
  },
  {
    icon: Camera,
    title: "Photo Capture",
    description: "Capture photo using your device camera directly in the browser.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Data",
    description: "Store student details securely with validated form submissions.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl font-semibold text-foreground md:text-3xl">
          Why Choose Us
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
          A fast, reliable, and secure student registration experience.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="group border-0 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="flex flex-col items-center p-8 text-center">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
