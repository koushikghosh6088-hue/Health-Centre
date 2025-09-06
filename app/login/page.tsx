'use client'

import { Suspense } from 'react'
import Loading from '../loading'
import LoginForm from './LoginForm'  // Assume you've moved your login form to a separate component

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginForm />
    </Suspense>
  )
}