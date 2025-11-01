'use client';

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

import './page.css'

import Button from '@/app/components/ui/button/button'

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, user } = useAuth();
    const router = useRouter();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Basic validation
        if (!email || !password) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        const result = await login(email, password);
        
        if (result.success) {
            router.push('/dashboard');
        } else {
            setError(result.error || 'Login failed');
        }
        
        setIsLoading(false);
    };

    return (
        <div className="LoginComponent">
            <div className="LoginComponent-in">

                <div className="login-one">
                    <div className="login-one-in">
                        <div className="login-one-one">
                            <Image
                                src="/1.png"
                                alt="CivicIndia Logo"
                                width={200}
                                height={200}
                            />
                        </div>
                        <div className="login-one-two">
                            <h1>Welcome to CivicIndia</h1>
                            <p>Your smart city issue management platform.</p>
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

                            <div className="login-one-three">
                                <input
                                    type="email"
                                    className='login-input'
                                    placeholder='Email Address'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            <div className="login-one-four">
                                <input
                                    type="password"
                                    className='login-input'
                                    placeholder='Password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            <div className="login-one-five">
                                <Link href="/auth/forgot-password">Forgot Password?</Link>
                            </div>
                            <div className="login-one-six">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Logging in...' : 'Login'}
                                </Button>
                            </div>
                        </form>

                        <div className="login-one-seven" style={{ 
                            textAlign: 'center', 
                            marginTop: '1rem', 
                            padding: '0 1rem' 
                        }}>
                            <p>Don't have an account? <Link href="/auth/signup">Sign Up</Link></p>
                        </div>
                    </div>
                </div>
                <div className="login-two">
                    <Image
                        src="/2.jpg"
                        alt="City Management"
                        width={200}
                        height={200}
                    />
                </div>

            </div>
        </div>
    )
}

export default LoginPage