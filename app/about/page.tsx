import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Award, 
  Users, 
  Heart, 
  Shield, 
  Clock, 
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Target,
  Eye,
  Microscope,
  Stethoscope,
  Activity
} from 'lucide-react'

export default function AboutPage() {
  const stats = [
    { icon: Users, number: '50,000+', label: 'Patients Served' },
    { icon: Award, number: '15+', label: 'Years of Excellence' },
    { icon: Microscope, number: '500+', label: 'Tests Available' },
    { icon: Stethoscope, number: '25+', label: 'Expert Doctors' },
  ]

  const features = [
    {
      icon: Shield,
      title: 'NABL Accredited Laboratory',
      description: 'Our laboratory is accredited by the National Accreditation Board for Testing and Calibration Laboratories, ensuring the highest quality standards.',
    },
    {
      icon: Clock,
      title: 'Quick Turnaround Time',
      description: 'Most test results are available within 24-48 hours with our efficient processing and state-of-the-art equipment.',
    },
    {
      icon: Heart,
      title: 'Patient-Centric Care',
      description: 'We prioritize patient comfort and care, ensuring a pleasant experience throughout your healthcare journey.',
    },
    {
      icon: Activity,
      title: 'Advanced Technology',
      description: 'Equipped with the latest diagnostic equipment and technology for accurate and reliable test results.',
    },
  ]

  const certifications = [
    'NABL Accredited',
    'ISO 15189:2012 Certified',
    'College of American Pathologists (CAP) Standards',
    'Quality Council of India (QCI) Approved',
    'Ministry of Health & Family Welfare Registered',
    'Indian Medical Association (IMA) Member'
  ]

  const team = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Chief Medical Officer',
      qualification: 'MD (Pathology), MBBS',
      experience: '15+ years',
      specialization: 'Clinical Pathology & Laboratory Medicine',
    },
    {
      name: 'Dr. Rajesh Kumar',
      role: 'Senior Consultant',
      qualification: 'MD (Internal Medicine), MBBS',
      experience: '12+ years',
      specialization: 'Internal Medicine & Diabetes Care',
    },
    {
      name: 'Dr. Priya Sharma',
      role: 'Consultant Radiologist',
      qualification: 'MD (Radiology), MBBS',
      experience: '10+ years',
      specialization: 'Diagnostic Imaging & Interventional Radiology',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About HealthCare Diagnostic Centre
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto">
              Providing comprehensive healthcare diagnostic services with state-of-the-art technology 
              and experienced medical professionals for over 15 years.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="p-8">
              <CardHeader className="pb-4">
                <div className="flex items-center mb-4">
                  <Target className="h-8 w-8 text-blue-600 mr-3" />
                  <CardTitle className="text-2xl">Our Mission</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-lg leading-relaxed">
                  To provide accurate, reliable, and timely diagnostic services that empower healthcare 
                  providers and patients to make informed medical decisions. We are committed to 
                  excellence in patient care, technological innovation, and continuous improvement 
                  in healthcare delivery.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardHeader className="pb-4">
                <div className="flex items-center mb-4">
                  <Eye className="h-8 w-8 text-blue-600 mr-3" />
                  <CardTitle className="text-2xl">Our Vision</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-lg leading-relaxed">
                  To be the leading diagnostic healthcare provider, recognized for our commitment to 
                  quality, innovation, and patient-centric care. We envision a future where advanced 
                  diagnostic technology and compassionate healthcare services come together to 
                  improve lives and build healthier communities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine cutting-edge technology with experienced medical professionals 
              to deliver exceptional healthcare services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Certifications & Accreditations
            </h2>
            <p className="text-xl text-gray-600">
              Our commitment to quality is validated by prestigious certifications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certifications.map((cert, index) => (
              <div 
                key={index} 
                className="flex items-center p-4 bg-white rounded-lg shadow-sm"
              >
                <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                <span className="font-medium text-gray-900">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Expert Team
            </h2>
            <p className="text-xl text-gray-600">
              Experienced medical professionals dedicated to your healthcare
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <p className="text-blue-600 font-medium">{member.role}</p>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-2">
                  <p><strong>Qualification:</strong> {member.qualification}</p>
                  <p><strong>Experience:</strong> {member.experience}</p>
                  <p><strong>Specialization:</strong> {member.specialization}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-8">Visit Our Centre</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Address</h3>
                    <p className="text-gray-300">
                      123 Healthcare Street<br />
                      Medical District<br />
                      City, State 123456
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Phone className="h-6 w-6 text-blue-400" />
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <p className="text-gray-300">+91 98765 43210</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Mail className="h-6 w-6 text-blue-400" />
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-gray-300">info@healthcarediagnostic.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-8">Working Hours</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span>Monday - Saturday</span>
                  <span className="text-blue-400">8:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span>Sunday</span>
                  <span className="text-blue-400">9:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span>Emergency Services</span>
                  <span className="text-green-400">24/7 Available</span>
                </div>
              </div>

              <div className="mt-8">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/contact">
                    Get in Touch
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
