import { authClient } from '@/lib/authClient'
import { redirect } from 'next/navigation'
import React from 'react'

export default function AuthLayout({
    children
}: {
    children: React.ReactNode
}) {
  return (
    <div>{children}</div>
  )
}
