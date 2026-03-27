import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import {
  featuresData,
  howItWorksData,
  statsData,
  testimonialsData,
} from "@/data/landing";
import HeroSection from "@/components/hero";
import Link from "next/link";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <section className="py-20 bg-blue-50">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {statsData.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mb-2 text-4xl font-bold text-blue-600">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container px-4 mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center">
            Everything you need to manage your finances
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuresData.map((feature, index) => (
              <Card className="p-6" key={index}>
                <CardContent className="pt-4 space-y-4">
                  {feature.icon}
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-blue-50">
        <div className="container px-4 mx-auto">
          <h2 className="mb-16 text-3xl font-bold text-center">How It Works</h2>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {howItWorksData.map((step, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full">
                  {step.icon}
                </div>
                <h3 className="mb-4 text-xl font-semibold">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container px-4 mx-auto">
          <h2 className="mb-16 text-3xl font-bold text-center">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonialsData.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="pt-4">
                  <div className="flex items-center mb-4">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="ml-4">
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600">{testimonial.quote}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container px-4 mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="max-w-2xl mx-auto mb-8 text-blue-100">
            Join thousands of users who are already managing their finances
            smarter with Welth
          </p>
          <Link href="/plans">
            <Button
              size="lg"
              className="text-blue-600 bg-white hover:bg-blue-50 animate-bounce"
            >
              View Plans
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
