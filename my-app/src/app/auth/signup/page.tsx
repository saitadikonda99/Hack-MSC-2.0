import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

import './page.css'

import Button from '@/app/components/ui/button/button'

const SignupPage = () => {
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
                            <h1>Create Your AxisBill Account</h1>
                            <p>Join the fastest way to manage all your billing needs.</p>
                        </div>

                        <div className="login-one-three">
                            <input
                                type="text"
                                className='login-input'
                                placeholder='Full Name'
                            />
                        </div>

                        <div className="login-one-four">
                            <input
                                type="email"
                                className='login-input'
                                placeholder='Email Address'
                            />
                        </div>

                        <div className="login-one-five">
                            <input
                                type="password"
                                className='login-input'
                                placeholder='Password'
                            />
                        </div>

                        <div className="login-one-six">
                            <input
                                type="password"
                                className='login-input'
                                placeholder='Confirm Password'
                            />
                        </div>

                        <div className="login-one-seven">
                            <Button>Sign Up</Button>
                        </div>

                        <div className="login-one-eight">
                            <p>Already have an account? <Link href="/auth/login">Login</Link></p>
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

export default SignupPage