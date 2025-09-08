'use client'

import { 
  Clock, 
  Shield, 
  Award, 
  Heart, 
  TestTube, 
  Stethoscope,
  Star,
  ArrowRight,
  CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

const services = [
  { 
    icon: Heart, 
    title: "Cardiology", 
    desc: "Advanced heart care and treatment with specialized cardiac facilities and expert cardiologists." 
  },
  { 
    icon: TestTube, 
    title: "Diagnostics", 
    desc: "State-of-the-art diagnostic facilities with quick and accurate test results." 
  },
  { 
    icon: Stethoscope, 
    title: "General Medicine", 
    desc: "Comprehensive healthcare solutions for all your medical needs with experienced physicians." 
  },
  { 
    icon: Shield, 
    title: "Preventive Care", 
    desc: "Regular health checkups and screenings to prevent and detect health issues early." 
  },
  { 
    icon: Award, 
    title: "Specialist Doctors", 
    desc: "Access to highly qualified medical professionals across various specializations." 
  },
  { 
    icon: Clock, 
    title: "24/7 Support", 
    desc: "Round-the-clock emergency services and medical assistance whenever you need." 
  }
]

const testimonials = [
  {
    name: "John Doe",
    comment: "Exceptional care and attention to detail. The staff was very professional and caring throughout my treatment.",
    rating: 5
  },
  {
    name: "Jane Smith",
    comment: "State-of-the-art facilities and expert doctors. I'm very satisfied with the quality of care I received.",
    rating: 5
  },
  {
    name: "Robert Johnson",
    comment: "Quick appointments and thorough diagnosis. The diagnostic center is well-equipped with modern technology.",
    rating: 5
  }
]

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-4 py-12 sm:px-6 lg:px-8 lg:py-24">
      {/* Hero Section */}
      <section className="w-full max-w-5xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
          Your Health, Our Priority
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-8">
          Advanced diagnostic services with state-of-the-art technology and expert care
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/tests">Browse Tests</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/doctors">Our Doctors</Link>
          </Button>
        </div>
      </section>

      {/* Services Section */}
      <section className="w-full max-w-5xl py-24">
        <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <Card key={index} className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <Icon className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.desc}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full max-w-5xl py-24">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Patients Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-2">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">{testimonial.comment}</p>
                <p className="font-semibold">{testimonial.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-5xl py-24">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex gap-4 items-start">
            <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold mb-2">Advanced Technology</h3>
              <p className="text-gray-600">State-of-the-art diagnostic equipment for accurate results</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold mb-2">Expert Doctors</h3>
              <p className="text-gray-600">Team of experienced healthcare professionals</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold mb-2">Quick Results</h3>
              <p className="text-gray-600">Fast and accurate diagnostic reports</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold mb-2">Affordable Care</h3>
              <p className="text-gray-600">Competitive pricing with high-quality service</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full max-w-5xl py-24 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Book Your Test?</h2>
        <p className="text-lg sm:text-xl text-gray-600 mb-8">
          Schedule your diagnostic test today and take the first step towards better health
        </p>
        <Button size="lg" className="gap-2" asChild>
          <Link href="/tests/book">
            Book Now <ArrowRight className="w-5 h-5" />
          </Link>
        </Button>
      </section>
    </main>
  )
}
