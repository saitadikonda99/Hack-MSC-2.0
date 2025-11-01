import React from 'react'
import Image from 'next/image'

import './page.css'

import Button from '@/app/components/ui/button/button'

const ResetPassword = () => {
  return (
    <div className="ResetPasswordComponent">
      <div className="ResetPasswordComponent-in">

        <div className="reset-one">
          <Image 
            src="/AxisBill.png"
            alt="AxisBill Logo"
            width={200}
            height={200}
          />
        </div>

        <div className="reset-two">
          <h1>Reset Your Password</h1>
          <p>Please enter your new password below.</p>
        </div>

        <div className="reset-three">
          <input
            type="password"
            className='reset-input'
            placeholder='New Password'
          />
        </div>

        <div className="reset-four">
          <input
            type="password"
            className='reset-input'
            placeholder='Confirm New Password'
          />
        </div>

        <div className="reset-five">
          <Button>Reset Password</Button>
        </div>

      </div>
    </div>
  )
}

export default ResetPassword