'use client';

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import './page.css'

import Button from '@/app/components/ui/button/button'

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        if (!email) {
            setError('Please enter your email address');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setEmail(''); // Clear the form
            } else {
                setError(data.error || 'Failed to send reset link');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="ForgotPasswordComponent">
            <div className="ForgotPasswordComponent-in">

                <div className="forgot-one">
                    <Image
                        src="/AxisBill.png"
                        alt="CivicIndia Logo"
                        width={200}
                        height={200}
                    />
                </div>

                <div className="forgot-two">
                    <h1>Forgot Your Password?</h1>
                    <p>Enter your email address below and we'll send you a link to reset your password.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{ 
                            color: '#dc2626', 
                            backgroundColor: '#fef2f2', 
                            padding: '0.75rem', 
                            borderRadius: '0.375rem', 
                            margin: '1rem 0',
                            border: '1px solid #fecaca',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    {message && (
                        <div style={{ 
                            color: '#059669', 
                            backgroundColor: '#ecfdf5', 
                            padding: '0.75rem', 
                            borderRadius: '0.375rem', 
                            margin: '1rem 0',
                            border: '1px solid #a7f3d0',
                            textAlign: 'center'
                        }}>
                            {message}
                        </div>
                    )}

                    <div className="forgot-three">
                        <input
                            type="email"
                            className='forgot-input'
                            placeholder='Email Address'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="forgot-four">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                    </div>
                </form>

                <div style={{ 
                    textAlign: 'center', 
                    marginTop: '1rem',
                    padding: '0 1rem'
                }}>
                    <Link href="/auth/login" style={{ color: '#0000ff', textDecoration: 'none' }}>
                        ← Back to Login
                    </Link>
                </div>

            </div>
        </div>
    )
}

export default ForgotPasswordPage