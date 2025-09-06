import { db } from './db'
import bcrypt from 'bcryptjs'

export async function seedDatabase() {
  try {
    // Clear existing data
    await db.testimonial.deleteMany()
    await db.testBookingItem.deleteMany()
    await db.testBooking.deleteMany()
    await db.appointment.deleteMany()
    await db.doctorAvailability.deleteMany()
    await db.test.deleteMany()
    await db.doctor.deleteMany()
    await db.user.deleteMany()

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const admin = await db.user.create({
      data: {
        email: 'admin@healthcarediagnostic.com',
        name: 'Healthcare Admin',
        phone: '+91 98765 43210',
        role: 'ADMIN',
        password: hashedPassword,
      },
    })

    // Create sample doctors
    const doctors = [
      {
        name: 'Dr. Sarah Johnson',
        specialization: 'Cardiologist',
        qualification: 'MD (Cardiology), MBBS',
        experience: 15,
        consultationFee: 800,
        bio: 'Experienced cardiologist specializing in heart disease prevention and treatment with over 15 years of practice.',
        image: '/doctors/dr-sarah-johnson.jpg',
      },
      {
        name: 'Dr. Rajesh Kumar',
        specialization: 'General Medicine',
        qualification: 'MBBS, MD (Internal Medicine)',
        experience: 12,
        consultationFee: 600,
        bio: 'General physician with expertise in internal medicine, diabetes management, and preventive healthcare.',
        image: '/doctors/dr-rajesh-kumar.jpg',
      },
      {
        name: 'Dr. Priya Sharma',
        specialization: 'Gynecologist',
        qualification: 'MS (Obstetrics & Gynecology), MBBS',
        experience: 10,
        consultationFee: 700,
        bio: 'Women\'s health specialist with focus on reproductive health, pregnancy care, and gynecological disorders.',
        image: '/doctors/dr-priya-sharma.jpg',
      },
      {
        name: 'Dr. Michael Chen',
        specialization: 'Endocrinologist',
        qualification: 'MD (Endocrinology), MBBS',
        experience: 8,
        consultationFee: 750,
        bio: 'Endocrinology specialist treating diabetes, thyroid disorders, and hormonal imbalances.',
        image: '/doctors/dr-michael-chen.jpg',
      },
      {
        name: 'Dr. Anjali Patel',
        specialization: 'Dermatologist',
        qualification: 'MD (Dermatology), MBBS',
        experience: 6,
        consultationFee: 650,
        bio: 'Skin specialist with expertise in acne treatment, anti-aging, and cosmetic dermatology.',
        image: '/doctors/dr-anjali-patel.jpg',
      },
    ]

    const createdDoctors = []
    for (const doctor of doctors) {
      const createdDoctor = await db.doctor.create({
        data: doctor,
      })
      createdDoctors.push(createdDoctor)

      // Create availability for each doctor (Mon-Sat, 9 AM - 6 PM)
      for (let day = 1; day <= 6; day++) {
        await db.doctorAvailability.create({
          data: {
            doctorId: createdDoctor.id,
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '18:00',
            isActive: true,
          },
        })
      }
    }

    // Create diagnostic tests
    const tests = [
      // Blood Tests
      {
        name: 'Complete Blood Count (CBC)',
        description: 'Comprehensive blood test to check overall health and detect various disorders',
        price: 400,
        category: 'Blood Tests',
        duration: 15,
        preparation: 'No special preparation required',
      },
      {
        name: 'Lipid Profile',
        description: 'Measures cholesterol and triglyceride levels to assess heart disease risk',
        price: 600,
        category: 'Blood Tests',
        duration: 15,
        preparation: '12-hour fasting required',
      },
      {
        name: 'Blood Sugar (Fasting)',
        description: 'Measures blood glucose levels after fasting',
        price: 200,
        category: 'Blood Tests',
        duration: 10,
        preparation: '8-12 hour fasting required',
      },
      {
        name: 'HbA1c (Glycosylated Hemoglobin)',
        description: 'Average blood sugar levels over the past 2-3 months',
        price: 500,
        category: 'Blood Tests',
        duration: 15,
        preparation: 'No fasting required',
      },
      {
        name: 'Thyroid Function Test (TSH, T3, T4)',
        description: 'Evaluates thyroid gland function',
        price: 700,
        category: 'Blood Tests',
        duration: 15,
        preparation: 'No special preparation required',
      },
      {
        name: 'Liver Function Test (LFT)',
        description: 'Assesses liver health and function',
        price: 800,
        category: 'Blood Tests',
        duration: 15,
        preparation: '8-hour fasting recommended',
      },
      {
        name: 'Kidney Function Test (KFT)',
        description: 'Evaluates kidney health and function',
        price: 600,
        category: 'Blood Tests',
        duration: 15,
        preparation: 'No special preparation required',
      },

      // Imaging Tests
      {
        name: 'X-Ray Chest',
        description: 'Imaging of chest to detect lung and heart conditions',
        price: 500,
        category: 'Imaging',
        duration: 10,
        preparation: 'Remove jewelry and metal objects',
      },
      {
        name: 'Ultrasound Abdomen',
        description: 'Imaging of abdominal organs',
        price: 1200,
        category: 'Imaging',
        duration: 30,
        preparation: '6-hour fasting and full bladder',
      },
      {
        name: 'ECG (Electrocardiogram)',
        description: 'Records electrical activity of the heart',
        price: 300,
        category: 'Cardiac',
        duration: 15,
        preparation: 'No special preparation required',
      },
      {
        name: 'Echo (Echocardiogram)',
        description: '2D ultrasound of the heart',
        price: 2000,
        category: 'Cardiac',
        duration: 45,
        preparation: 'No special preparation required',
      },
      {
        name: 'CT Scan Head',
        description: 'Detailed imaging of brain and skull',
        price: 3500,
        category: 'Imaging',
        duration: 20,
        preparation: 'Remove metal objects, inform about allergies',
      },
      {
        name: 'MRI Brain',
        description: 'Detailed magnetic resonance imaging of brain',
        price: 6000,
        category: 'Imaging',
        duration: 60,
        preparation: 'Remove all metal objects, inform about implants',
      },

      // Health Packages
      {
        name: 'Executive Health Checkup',
        description: 'Comprehensive health screening package',
        price: 4500,
        category: 'Health Packages',
        duration: 120,
        preparation: '12-hour fasting required',
      },
      {
        name: 'Diabetes Screening Package',
        description: 'Complete diabetes assessment package',
        price: 1800,
        category: 'Health Packages',
        duration: 45,
        preparation: '12-hour fasting required',
      },
      {
        name: 'Heart Health Package',
        description: 'Comprehensive cardiac health assessment',
        price: 3200,
        category: 'Health Packages',
        duration: 90,
        preparation: 'No special preparation required',
      },
    ]

    const createdTests = []
    for (const test of tests) {
      const createdTest = await db.test.create({
        data: test,
      })
      createdTests.push(createdTest)
    }

    // Create sample patients
    const patients = [
      {
        email: 'patient1@example.com',
        name: 'John Doe',
        phone: '+91 98765 12345',
        role: 'PATIENT' as const,
        password: await bcrypt.hash('patient123', 10),
      },
      {
        email: 'patient2@example.com',
        name: 'Jane Smith',
        phone: '+91 98765 12346',
        role: 'PATIENT' as const,
        password: await bcrypt.hash('patient123', 10),
      },
    ]

    const createdPatients = []
    for (const patient of patients) {
      const createdPatient = await db.user.create({
        data: patient,
      })
      createdPatients.push(createdPatient)
    }

    // Create sample testimonials
    const testimonials = [
      {
        patientId: createdPatients[0].id,
        name: 'Sarah Johnson',
        message: 'Excellent service and professional staff. The online booking made it so convenient!',
        rating: 5,
        isActive: true,
      },
      {
        patientId: createdPatients[1].id,
        name: 'Dr. Rajesh Kumar',
        message: 'Quick and accurate test results. I always recommend this centre to my patients.',
        rating: 5,
        isActive: true,
      },
      {
        patientId: createdPatients[0].id,
        name: 'Priya Sharma',
        message: 'Very clean facilities and caring staff. The home collection service is fantastic!',
        rating: 5,
        isActive: true,
      },
      {
        patientId: createdPatients[1].id,
        name: 'Michael Brown',
        message: 'Professional doctors and state-of-the-art equipment. Highly satisfied with the service.',
        rating: 5,
        isActive: true,
      },
      {
        patientId: createdPatients[0].id,
        name: 'Anjali Patel',
        message: 'The staff is very helpful and the reports are accurate. Will definitely come back.',
        rating: 4,
        isActive: true,
      },
    ]

    for (const testimonial of testimonials) {
      await db.testimonial.create({
        data: testimonial,
      })
    }

    console.log('Database seeded successfully!')
    console.log(`Created ${createdDoctors.length} doctors`)
    console.log(`Created ${createdTests.length} tests`)
    console.log(`Created ${createdPatients.length} patients`)
    console.log(`Created ${testimonials.length} testimonials`)

  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
}
