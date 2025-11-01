import React from 'react'
import Image from 'next/image'

import './page.css'

import Button from '@/app/components/ui/button/button'

const page = () => {
    return (
        <div className="ForgotPasswordComponent">
            <div className="ForgotPasswordComponent-in">

                <div className="forgot-one">
                    <Image
                        src="/AxisBill.png"
                        alt="AxisBill Logo"
                        width={200}
                        height={200}
                    />
                </div>

                <div className="forgot-two">
                    <h1>Forgot Your Password?</h1>
                    <p>Enter your email address below and we'll send you a link to reset your password.</p>
                </div>

                <div className="forgot-three">
                    <input
                        type="email"
                        className='forgot-input'
                        placeholder='Email Address'
                    />
                </div>

                <div className="forgot-four">
                    <Button>Send Reset Link</Button>
                </div>

            </div>
        </div>
    )
}

export default page