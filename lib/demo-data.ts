import { db } from './db'

export async function addDemoData() {
  try {
    console.log('Adding demo doctors...')
    
    // Add demo doctors
    const demoDoctors = [
      {
        name: 'Dr. Sarah Johnson',
        specialization: 'Cardiology',
        qualification: 'MD, DM Cardiology',
        experience: 12,
        consultationFee: 1500,
        bio: 'Expert cardiologist with 12 years of experience in treating heart conditions. Specializes in interventional cardiology and preventive care.',
        isActive: true
      },
      {
        name: 'Dr. Michael Chen',
        specialization: 'Neurology',
        qualification: 'MD, DM Neurology',
        experience: 15,
        consultationFee: 1800,
        bio: 'Renowned neurologist specializing in stroke treatment, epilepsy, and movement disorders. Published researcher in neurological sciences.',
        isActive: true
      },
      {
        name: 'Dr. Emily Rodriguez',
        specialization: 'Pediatrics',
        qualification: 'MD, DCH',
        experience: 8,
        consultationFee: 1200,
        bio: 'Caring pediatrician with expertise in child development, vaccinations, and common childhood illnesses. Child-friendly approach.',
        isActive: true
      },
      {
        name: 'Dr. James Wilson',
        specialization: 'Orthopedics',
        qualification: 'MS Orthopedics, MCh',
        experience: 20,
        consultationFee: 2000,
        bio: 'Senior orthopedic surgeon specializing in joint replacements, sports injuries, and spine surgery. 20+ years of surgical experience.',
        isActive: true
      },
      {
        name: 'Dr. Lisa Anderson',
        specialization: 'Dermatology',
        qualification: 'MD, DDV',
        experience: 10,
        consultationFee: 1300,
        bio: 'Board-certified dermatologist specializing in skin cancer treatment, cosmetic dermatology, and complex skin conditions.',
        isActive: true
      }
    ]

    for (const doctorData of demoDoctors) {
      const doctor = await db.doctor.create({
        data: doctorData
      })

      // Add availability for each doctor (Monday to Friday, 9 AM to 5 PM)
      for (let day = 1; day <= 5; day++) {
        await db.doctorAvailability.create({
          data: {
            doctorId: doctor.id,
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '17:00',
            isActive: true
          }
        })
      }
    }

    console.log('Adding demo tests...')
    
    // Add demo tests
    const demoTests = [
      {
        name: 'Complete Blood Count (CBC)',
        description: 'A comprehensive blood test that measures different components of blood including red blood cells, white blood cells, and platelets.',
        price: 300,
        category: 'Blood Tests',
        duration: 'Same day',
        preparation: 'No special preparation required. Fasting not necessary.',
        isActive: true
      },
      {
        name: 'Lipid Profile',
        description: 'Measures cholesterol levels including total cholesterol, HDL, LDL, and triglycerides to assess heart disease risk.',
        price: 500,
        category: 'Blood Tests',
        duration: 'Same day',
        preparation: '12-hour fasting required. Only water allowed.',
        isActive: true
      },
      {
        name: 'Thyroid Function Test (TFT)',
        description: 'Comprehensive thyroid panel including TSH, T3, T4 to evaluate thyroid gland function.',
        price: 800,
        category: 'Hormone Tests',
        duration: 'Same day',
        preparation: 'No special preparation required.',
        isActive: true
      },
      {
        name: 'ECG (Electrocardiogram)',
        description: 'Records electrical activity of the heart to detect heart rhythm and conduction abnormalities.',
        price: 400,
        category: 'Cardiac',
        duration: 'Same day',
        preparation: 'No special preparation required.',
        isActive: true
      },
      {
        name: 'Chest X-Ray',
        description: 'Imaging test to examine the chest, lungs, heart, and surrounding structures.',
        price: 600,
        category: 'Imaging',
        duration: 'Same day',
        preparation: 'Remove jewelry and metal objects. Wear loose clothing.',
        isActive: true
      },
      {
        name: 'Ultrasound Abdomen',
        description: 'Non-invasive imaging to examine abdominal organs including liver, gallbladder, kidneys, and pancreas.',
        price: 1200,
        category: 'Imaging',
        duration: 'Same day',
        preparation: '6-hour fasting required. Drink water as instructed.',
        isActive: true
      },
      {
        name: 'Diabetes Package',
        description: 'Comprehensive diabetes screening including HbA1c, fasting glucose, and post-prandial glucose.',
        price: 1000,
        category: 'Health Packages',
        duration: 'Same day',
        preparation: '12-hour fasting required for accurate results.',
        isActive: true
      },
      {
        name: 'Liver Function Test (LFT)',
        description: 'Panel of blood tests to assess liver health and function including enzymes, proteins, and bilirubin.',
        price: 600,
        category: 'Blood Tests',
        duration: 'Same day',
        preparation: 'No special preparation required.',
        isActive: true
      },
      {
        name: 'Kidney Function Test (KFT)',
        description: 'Blood and urine tests to evaluate kidney function including creatinine, BUN, and eGFR.',
        price: 700,
        category: 'Blood Tests',
        duration: 'Same day',
        preparation: 'No special preparation required.',
        isActive: true
      },
      {
        name: 'Vitamin D Test',
        description: 'Measures vitamin D levels in blood to assess bone health and immune function.',
        price: 900,
        category: 'Hormone Tests',
        duration: 'Same day',
        preparation: 'No special preparation required.',
        isActive: true
      }
    ]

    for (const testData of demoTests) {
      await db.test.create({
        data: testData
      })
    }

    console.log('Demo data added successfully!')
    return { success: true, message: 'Demo data added successfully' }
  } catch (error) {
    console.error('Error adding demo data:', error)
    return { success: false, error: 'Failed to add demo data' }
  }
}
