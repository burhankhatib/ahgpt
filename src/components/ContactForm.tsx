'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    jobRole: string;
    ministry: string;
    mobile: string;
    message: string;
    captcha: string;
}

interface FormErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    jobRole?: string;
    ministry?: string;
    mobile?: string;
    message?: string;
    captcha?: string;
}

// Bible words for captcha
const BIBLE_WORDS = [
    'faith', 'hope', 'love', 'grace', 'peace', 'joy', 'light', 'truth', 'wisdom', 'mercy',
    'blessing', 'prayer', 'salvation', 'forgiveness', 'righteousness', 'glory', 'worship', 'praise',
    'heaven', 'eternal', 'sacred', 'holy', 'divine', 'spirit', 'soul', 'heart', 'covenant',
    'promise', 'miracle', 'redemption', 'sanctuary', 'temple', 'altar', 'shepherd', 'lamb',
    'vine', 'bread', 'water', 'rock', 'foundation', 'cornerstone', 'resurrection', 'ascension',
    'kingdom', 'throne', 'crown', 'victory', 'triumph', 'glory', 'majesty', 'power'
];

export default function ContactForm() {
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        email: '',
        jobRole: '',
        ministry: '',
        mobile: '',
        message: '',
        captcha: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [captchaWord, setCaptchaWord] = useState('');

    // Generate a random Bible word for captcha
    const generateCaptchaWord = () => {
        const randomIndex = Math.floor(Math.random() * BIBLE_WORDS.length);
        setCaptchaWord(BIBLE_WORDS[randomIndex]);
    };

    // Generate captcha word on component mount
    useEffect(() => {
        generateCaptchaWord();
    }, []);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.ministry.trim()) {
            newErrors.ministry = 'Ministry/Organization is required';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.trim().length < 20) {
            newErrors.message = 'Message must be at least 20 characters long';
        }

        if (!formData.captcha.trim()) {
            newErrors.captcha = 'Please verify you are not a robot';
        } else if (formData.captcha.toLowerCase() !== captchaWord.toLowerCase()) {
            newErrors.captcha = `Incorrect answer. Please type "${captchaWord}"`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success('Message sent successfully!');
                setIsSubmitted(true);
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleNewCaptcha = () => {
        generateCaptchaWord();
        setFormData(prev => ({ ...prev, captcha: '' }));
        if (errors.captcha) {
            setErrors(prev => ({ ...prev, captcha: undefined }));
        }
    };

    if (isSubmitted) {
        return (
            <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
                <div className="text-center">
                    <div className="mb-6">
                        <svg
                            className="mx-auto h-12 w-12 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Thank You!
                    </h2>

                    <p className="text-gray-600 mb-8">
                        Your message has been sent successfully. We will get back to you as soon as possible.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/">
                            <Button variant="default" className="w-full sm:w-auto">
                                Go to Homepage
                            </Button>
                        </Link>
                        <Link href="/chat">
                            <Button variant="outline" className="w-full sm:w-auto">
                                Go to Chat
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Contact Us
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="firstName">
                            First Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="firstName"
                            name="firstName"
                            type="text"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={errors.firstName ? 'border-red-500' : ''}
                            placeholder="Enter your first name"
                        />
                        {errors.firstName && (
                            <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="lastName">
                            Last Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="lastName"
                            name="lastName"
                            type="text"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className={errors.lastName ? 'border-red-500' : ''}
                            placeholder="Enter your last name"
                        />
                        {errors.lastName && (
                            <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                        )}
                    </div>
                </div>

                <div>
                    <Label htmlFor="email">
                        Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={errors.email ? 'border-red-500' : ''}
                        placeholder="Enter your email address"
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="ministry">
                        Ministry/Organization <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="ministry"
                        name="ministry"
                        type="text"
                        value={formData.ministry}
                        onChange={handleInputChange}
                        className={errors.ministry ? 'border-red-500' : ''}
                        placeholder="Enter your ministry or organization"
                    />
                    {errors.ministry && (
                        <p className="text-red-500 text-sm mt-1">{errors.ministry}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="jobRole">
                            Job Role <span className="text-gray-400">(Optional)</span>
                        </Label>
                        <Input
                            id="jobRole"
                            name="jobRole"
                            type="text"
                            value={formData.jobRole}
                            onChange={handleInputChange}
                            className={errors.jobRole ? 'border-red-500' : ''}
                            placeholder="Enter your job role"
                        />
                        {errors.jobRole && (
                            <p className="text-red-500 text-sm mt-1">{errors.jobRole}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="mobile">
                            Mobile Number <span className="text-gray-400">(Optional)</span>
                        </Label>
                        <Input
                            id="mobile"
                            name="mobile"
                            type="tel"
                            value={formData.mobile}
                            onChange={handleInputChange}
                            className={errors.mobile ? 'border-red-500' : ''}
                            placeholder="Enter your mobile number"
                        />
                        {errors.mobile && (
                            <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
                        )}
                    </div>
                </div>

                <div>
                    <Label htmlFor="message">
                        Message <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        className={errors.message ? 'border-red-500' : ''}
                        placeholder="Enter your message (minimum 20 characters)"
                        rows={5}
                    />
                    {errors.message && (
                        <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="captcha">
                        Verification <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm text-gray-600">
                            Please type &quot;{captchaWord}&quot; to verify you are not a robot:
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleNewCaptcha}
                            className="text-xs px-2 py-1"
                        >
                            New Word
                        </Button>
                    </div>
                    <Input
                        id="captcha"
                        name="captcha"
                        type="text"
                        value={formData.captcha}
                        onChange={handleInputChange}
                        className={errors.captcha ? 'border-red-500' : ''}
                        placeholder={`Type '${captchaWord}' here`}
                    />
                    {errors.captcha && (
                        <p className="text-red-500 text-sm mt-1">{errors.captcha}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
            </form>
        </div>
    );
} 