import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

import './page.css'

import Button from '@/app/components/ui/button/button'

const page = () => {
    return (
        <div className="LoginComponent">
            <div className="LoginComponent-in">

                <div className="login-one">
                    <div className="login-one-in">
                        <div className="login-one-one">
                            <Image
                                src="/AxisBill.png"
                                alt="AxisBill Logo"
                                width={200}
                                height={200}
                            />
                        </div>
                        <div className="login-one-two">
                            <h1>Welcome to AxisBill.</h1>
                            <p>Your one-stop solution for all billing needs.</p>
                        </div>
                        <div className="login-one-three">
                            <input
                                type="text"
                                className='login-input'
                                placeholder='Email or Username'
                            />
                        </div>
                        <div className="login-one-four">
                            <input
                                type="password"
                                className='login-input'
                                placeholder='Password'
                            />
                        </div>
                        <div className="login-one-five">
                            <Link href="/auth/forgot-password">Forgot Password?</Link>
                        </div>
                        <div className="login-one-six">
                            <Button>Login</Button>
                        </div>
                    </div>
                </div>
                <div className="login-two">
                    <Image
                        src="/Invoice.jpeg"
                        alt="Invoice Photo"
                        width={200}
                        height={200}
                    />
                </div>

            </div>
        </div>
    )
}

export default page