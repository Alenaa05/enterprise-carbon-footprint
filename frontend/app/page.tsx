import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Leaf,
  BarChart3,
  Zap,
  Users,
  Shield,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Navigation */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white font-bold text-lg">
              S
            </div>
            <span className="text-xl font-bold">SustainHub</span>
          </div>

          <Link href="/login">
            <Button className="bg-green-600 hover:bg-green-700">
              Enter Platform
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700">
          <Leaf className="h-4 w-4" />
          <span className="text-sm font-semibold">
            Enterprise Sustainability Platform
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Take Control of Your{" "}
          <span className="text-green-600">Sustainability</span> Journey
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          AI-powered platform for enterprises to track emissions, manage energy,
          water, and waste, while meeting compliance requirements and achieving
          sustainability goals.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <Button size="lg" variant="outline">
            View Demo
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">10 Core Modules</h2>
          <p className="text-gray-600 text-lg">
            Everything you need for enterprise sustainability
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              icon: BarChart3,
              title: "Dashboard",
              desc: "Real-time sustainability overview",
            },
            {
              icon: Leaf,
              title: "Carbon Tracking",
              desc: "Monitor emissions by source",
            },
            {
              icon: Zap,
              title: "Energy Mgmt",
              desc: "Track and optimize usage",
            },
            {
              icon: TrendingUp,
              title: "Water Tracking",
              desc: "Monitor consumption",
            },
            { icon: Shield, title: "Waste Mgmt", desc: "Manage waste streams" },
            {
              icon: TrendingUp,
              title: "Supply Chain",
              desc: "Supplier sustainability",
            },
            {
              icon: Shield,
              title: "Compliance",
              desc: "Regulatory requirements",
            },
            {
              icon: Users,
              title: "Goals & Targets",
              desc: "Set and track goals",
            },
            {
              icon: Users,
              title: "Team Collab",
              desc: "Cross-team coordination",
            },
            { icon: BarChart3, title: "Reports", desc: "AI-powered analytics" },
          ].map((feature, idx) => {
            const Icon = feature.icon;

            return (
              <div
                key={idx}
                className="p-6 rounded-lg border bg-white hover:shadow-lg transition-shadow"
              >
                <Icon className="h-8 w-8 text-green-600 mb-3" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold mb-12 text-center">
          Why Choose SustainHub
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            {[
              {
                title: "AI-Powered Insights",
                desc: "OpenAI integration for intelligent recommendations and anomaly detection",
              },
              {
                title: "Real-Time Tracking",
                desc: "Monitor sustainability metrics across all facilities in real-time",
              },
              {
                title: "Compliance Ready",
                desc: "Built for ISO 14001, CDP, CSRD and other major frameworks",
              },
              {
                title: "Cloud Native",
                desc: "Deployed on AWS with DynamoDB for scalability and reliability",
              },
            ].map((benefit, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">
                    {idx + 1}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-8 text-white flex flex-col justify-center">
            <h3 className="text-3xl font-bold mb-6">
              Transform Your Sustainability
            </h3>

            <ul className="space-y-4 mb-8">
              <li className="flex gap-3">
                <span className="text-green-300 font-bold">✓</span>
                <span>Reduce carbon emissions by 40-50%</span>
              </li>

              <li className="flex gap-3">
                <span className="text-green-300 font-bold">✓</span>
                <span>Lower energy costs through optimization</span>
              </li>

              <li className="flex gap-3">
                <span className="text-green-300 font-bold">✓</span>
                <span>Meet all regulatory compliance requirements</span>
              </li>

              <li className="flex gap-3">
                <span className="text-green-300 font-bold">✓</span>
                <span>Engage teams in sustainability initiatives</span>
              </li>
            </ul>

            <p className="text-green-100 text-sm">
              Join leading enterprises already using SustainHub to achieve their
              sustainability goals
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="bg-gray-900 text-white rounded-xl p-12">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Lead in Sustainability?
          </h2>

          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Start tracking your organization's environmental impact today with
            SustainHub's comprehensive platform.
          </p>

          <Link href="/login">
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              Launch Platform <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center text-sm text-gray-600">
          <p>© 2024 SustainHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
