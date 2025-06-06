'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

function AdminMenu() {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;

    return (
        <div className="flex text-left w-full bg-gray-100 p-4" dir="ltr">
            <ul className="flex gap-2 w-full justify-center">
                <li>
                    <Link href="/admin/domains" className={isActive('/admin/domains') ? 'text-blue-500' : 'text-gray-500'}>Domains</Link>
                </li>
                <li>
                    <Link href="/admin/dashboard" className={isActive('/admin/dashboard') ? 'text-blue-500' : 'text-gray-500'}>Dashboard</Link>
                </li>
            </ul>
        </div>
    )
}

export default AdminMenu