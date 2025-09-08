import { NextRequest, NextResponse } from 'next/server'
import { addDemoData } from '@/lib/demo-data'

export async function POST(request: NextRequest) {
  try {
    const result = await addDemoData()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Demo data added successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error adding demo data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add demo data' },
      { status: 500 }
    )
  }
}





