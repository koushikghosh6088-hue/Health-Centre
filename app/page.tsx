"use client"

import { 
  Calendar, 
  Clock, 
  Shield, 
  Users, 
  User,   // ✅ added User import
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

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="px-4 pt-20 pb-32 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
          Advanced Diagnostic & Heart Care Center
        </h1>
        <p className="text-lg md:text-xl mb-8 text-gray-600 max-w-2xl mx-auto">
          Comprehensive healthcare services with state-of-the-art diagnostic facilities
          and expert cardiac care.
        </p>
        <Button size="lg" className="rounded-2xl px-8 py-6 text-lg">
          Book Appointment
        </Button>
      </section>

      {/* Services Section */}
      <section className="px-4 py-20 bg-white">
        <h2 className="text-3xl font-bold text-center mb-16">Our Services</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { icon: Heart, title: "Cardiology", desc: "Advanced heart care and treatment" },
            { icon: TestTube, title: "Diagnostics", desc: "Comprehensive diagnostic facilities" },
            { icon: Stethoscope, title: "General Medicine", desc: "Complete healthcare solutions" },
            { icon: Shield, title: "Preventive Care", desc: "Health checkups and screenings" },
            { icon: Award, title: "Specialist Doctors", desc: "Expert medical professionals" },
            { icon: Clock, title: "24/7 Support", desc: "Round the clock emergency services" }
          ].map((service, i) => (
            <Card key={i} className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <service.icon className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-4 py-20 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-16">Test Prices</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { test: "ECG", price: "₹500" },
            { test: "Echocardiography", price: "₹2,500" },
            { test: "Blood Test Package", price: "₹1,200" },
            { test: "TMT", price: "₹3,000" },
            { test: "Full Body Checkup", price: "₹5,000" },
            { test: "Cardiac Screening", price: "₹4,500" }
          ].map((item, i) => (
            <Card key={i} className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">{item.test}</h3>
                <p className="text-2xl font-bold text-blue-600">{item.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-4 py-20 bg-white">
        <h2 className="text-3xl font-bold text-center mb-16">Patient Testimonials</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            { name: "Rahul Sharma", text: "Excellent care and modern facilities. The doctors are very professional." },
            { name: "Priya Verma", text: "Highly satisfied with the diagnostic services. Quick and accurate results." }
          ].map((t, i) => (
            <Card key={i} className="rounded-2xl shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <User className="mr-3 h-5 w-5" /> {/* ✅ fixed User usage */}
                  <span className="font-semibold">{t.name}</span>
                </div>
                <p className="text-gray-600">{t.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-4 py-20 bg-blue-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Book Your Appointment?</h2>
        <Button 
          size="lg" 
          className="rounded-2xl px-8 py-6 text-lg bg-white text-blue-600 hover:bg-gray-100"
        >
          Schedule Now <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </section>
    </div>
  )
}
