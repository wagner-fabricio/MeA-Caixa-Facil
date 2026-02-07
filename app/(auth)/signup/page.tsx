'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Lock, User, Briefcase, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

const BUSINESS_TYPES = [
    { value: 'barbershop', label: '💈 Barbearia', icon: '💈' },
    { value: 'salon', label: '💅 Salão de Beleza', icon: '💅' },
    { value: 'workshop', label: '🔧 Oficina', icon: '🔧' },
    { value: 'retail', label: '🛒 Comércio', icon: '🛒' },
    { value: 'other', label: '📋 Outro', icon: '📋' },
]

export default function SignupPage() {
    const router = useRouter()
    const supabase = createClient()
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        businessName: '',
        businessType: 'barbershop',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [supabaseId, setSupabaseId] = useState<string | null>(null)

    const handleStep1Submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Attempt to sign up - this will catch if email is already taken
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        name: formData.name,
                    }
                }
            })

            if (authError) {
                // Supabase sometimes returns "User already registered" as an error
                if (authError.message.toLowerCase().includes('already registered') || authError.status === 422) {
                    throw new Error('Este email já está cadastrado. Tente fazer login.')
                }
                throw authError
            }

            if (authData.user) {
                setSupabaseId(authData.user.id)
                setStep(2)
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (!supabaseId) {
                throw new Error('Falha na identificação do usuário. Tente novamente.')
            }

            // 2. Create business and categories in our DB
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    supabaseId: supabaseId
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao configurar seu negócio')
            }

            // check session (it might be null if email confirmation is required)
            const { data: { session } } = await supabase.auth.getSession()

            if (session) {
                router.push('/dashboard')
                router.refresh()
            } else {
                setStep(3); // Success/Email step
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/api/auth/callback`,
                },
            })
            if (error) throw error
        } catch (err) {
            console.error('Erro no login Google (Signup):', err)
            setError('Falha ao iniciar login com Google. Verifique o console.')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-cyan/10 via-white to-primary-navy/5 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/logo.svg"
                            alt="M&A Caixa Fácil"
                            width={60}
                            height={60}
                            className="w-15 h-15"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-primary-navy">
                        {step === 3 ? 'Conta Criada!' : 'Crie sua conta grátis'}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {step === 1 ? 'Seus dados pessoais' : step === 2 ? 'Sobre seu negócio' : 'Verifique seu email'}
                    </p>
                </div>

                {/* Signup Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Progress Indicator */}
                    {step < 3 && (
                        <div className="flex gap-2 mb-6">
                            <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-primary-cyan' : 'bg-gray-200'}`} />
                            <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-primary-cyan' : 'bg-gray-200'}`} />
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {step === 1 ? (
                            <>
                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nome
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            id="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-cyan focus:border-transparent outline-none"
                                            placeholder="Seu nome"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-cyan focus:border-transparent outline-none"
                                            placeholder="seu@email.com"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                        Senha
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-cyan focus:border-transparent outline-none"
                                            placeholder="Mínimo 6 caracteres"
                                            minLength={6}
                                            required
                                        />
                                    </div>
                                </div>

                                {error && step === 1 && (
                                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={handleStep1Submit}
                                    disabled={loading}
                                    className="w-full bg-primary-cyan text-white py-3 rounded-xl font-semibold hover:bg-primary-cyan/90 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Validando...
                                        </>
                                    ) : (
                                        'Próximo'
                                    )}
                                </button>
                            </>
                        ) : step === 2 ? (
                            <>
                                {/* Business Name */}
                                <div>
                                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nome do Negócio
                                    </label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            id="businessName"
                                            type="text"
                                            value={formData.businessName}
                                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-cyan focus:border-transparent outline-none"
                                            placeholder="Ex: Barbearia do João"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Business Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo de Negócio
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {BUSINESS_TYPES.map((type) => (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, businessType: type.value })}
                                                className={`p-3 rounded-xl border-2 transition-all text-left ${formData.businessType === type.value
                                                    ? 'border-primary-cyan bg-primary-cyan/5'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="text-2xl mb-1">{type.icon}</div>
                                                <div className="text-sm font-medium text-gray-700">
                                                    {type.label.replace(/^.+\s/, '')}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                                    >
                                        Voltar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-primary-cyan text-white py-3 rounded-xl font-semibold hover:bg-primary-cyan/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Criando...
                                            </>
                                        ) : (
                                            'Criar Conta'
                                        )}
                                    </button>
                                </div>
                            </>
                        ) : step === 3 ? (
                            <div className="text-center space-y-6 py-4">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-10 h-10 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-primary-navy">
                                    Quase lá!
                                </h2>
                                <p className="text-gray-600">
                                    Enviamos um link de confirmação para o seu email.
                                    Por favor, verifique sua caixa de entrada (e o spam) para ativar sua conta.
                                </p>
                                <div className="pt-4">
                                    <Link
                                        href="/login"
                                        className="inline-block w-full bg-primary-cyan text-white py-3 rounded-xl font-semibold hover:bg-primary-cyan/90 transition-all"
                                    >
                                        Ir para o Login
                                    </Link>
                                </div>
                            </div>
                        ) : null}
                    </form>

                    {step === 1 && (
                        <>
                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">ou</span>
                                </div>
                            </div>

                            {/* Google Sign Up */}
                            <button
                                onClick={handleGoogleSignIn}
                                type="button"
                                className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Continuar com Google
                            </button>
                        </>
                    )}

                    {step < 3 && (
                        <p className="text-center text-sm text-gray-600 mt-6">
                            Já tem uma conta?{' '}
                            <Link href="/login" className="text-primary-cyan font-semibold hover:underline">
                                Fazer login
                            </Link>
                        </p>
                    )}
                </div>

                {/* Back to Home */}
                {step < 3 && (
                    <div className="text-center mt-6">
                        <Link href="/" className="text-sm text-gray-600 hover:text-primary-cyan transition-colors">
                            ← Voltar para o início
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
