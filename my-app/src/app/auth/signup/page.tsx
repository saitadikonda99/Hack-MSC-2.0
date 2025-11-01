'use client';

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

import './page.css'

import Button from '@/app/components/ui/button/button'

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { signup, user } = useAuth();
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
        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        const result = await signup(name, email, password);
        
        if (result.success) {
            router.push('/dashboard');
        } else {
            setError(result.error || 'Signup failed');
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
                            <h1>Join CivicIndia</h1>
                            <p>Help build better communities together.</p>
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
                                    type="text"
                                    className='login-input'
                                    placeholder='Full Name'
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>

                            <div className="login-one-four">
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

                            <div className="login-one-five">
                                <input
                                    type="password"
                                    className='login-input'
                                    placeholder='Password (min. 6 characters)'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>

                            <div className="login-one-six">
                                <input
                                    type="password"
                                    className='login-input'
                                    placeholder='Confirm Password'
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>

                            <div className="login-one-seven">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                                </Button>
                            </div>
                        </form>

                        <div className="login-one-eight">
                            <p>Already have an account? <Link href="/auth/login">Login</Link></p>
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

export default SignupPage