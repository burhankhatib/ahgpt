'use client'
import AdminMenu from '@/components/AdminMenu';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

function AdminPage() {

    const { user, isLoaded } = useUser();
    const router = useRouter();
    const isAllowed = user?.emailAddresses[0]?.emailAddress === 'burhank@gmail.com' || user?.emailAddresses[0]?.emailAddress === 'abuali7777@gmail.com';


    // useEffect(() => {
    //     if (isLoaded && (!user || !isAllowed)) {
    //         router.push('/');
    //     }
    // }, [isLoaded, isAllowed, user, router]);

    // if (!isLoaded || !user || !isAllowed) {
    //     return null;
    // }



    return (
        <div className="flex flex-col min-h-screen justify-center items-center">
            <div className="fixed top-0 z-10 flex-col justify-center items-center text-left w-full" dir="ltr">
                {isAllowed && <AdminMenu />}
            </div>
            {isAllowed ? (
                <div className="flex flex-col justify-center items-center text-left" dir="ltr">
                    <h1 className="text-4xl font-bold">Welcome Admin</h1>
                    <p className="text-lg">You can manage the domains and the chats here!</p>
                </div>
            ) : (
                <div className="flex flex-col justify-center items-center text-left" dir="ltr">
                    <h1 className="text-4xl font-bold">You are not allowed to access this page</h1>
                    <p className="text-lg">Please contact the admin to get access</p>
                </div>
            )
            }
        </div>
    )
}


export default AdminPage