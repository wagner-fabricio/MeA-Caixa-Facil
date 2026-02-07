'use client'

import { Suspense } from 'react'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Loader2, ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

function ForgotPasswordContent() {
    const supabase = createClient()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')
        setError('')

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            })
            if (error) throw error
            setMessage('Enviamos um link de recuperação para o seu e-mail.')
        } catch (err: any) {
            setError(err.message || 'Erro ao processar solicitação.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-cyan/10 via-white to-primary-navy/5 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Image src="/logo.svg" alt="M&A Caixa Fácil" width={60} height={60} />
                    </div>
                    <h1 className="text-3xl font-bold text-primary-navy">Recuperar Senha</h1>
                    <p className="text-gray-600 mt-2">Enviaremos um link para o seu e-mail</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {message ? (
                        <div className="text-center space-y-4">
                            <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm">
                                {message}
                            </div>
                            <Link href="/login" className="flex items-center justify-center gap-2 text-primary-cyan font-semibold hover:underline">
                                <ArrowLeft className="w-4 h-4" /> Voltar para o Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-cyan outline-none transition-all"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                            </div>

                            {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">{error}</div>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary-cyan text-white py-3 rounded-xl font-semibold hover:bg-primary-cyan/90 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar link de recuperação'}
                            </button>

                            <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-primary-navy transition-colors pt-2">
                                <ArrowLeft className="w-4 h-4" /> Voltar para o Login
                            </Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-primary-cyan" /></div>}>
            <ForgotPasswordContent />
        </Suspense>
    )
}
