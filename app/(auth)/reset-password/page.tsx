'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Lock, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function ResetPasswordPage() {
    const router = useRouter()
    const supabase = createClient()
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { error } = await supabase.auth.updateUser({ password })
            if (error) throw error
            setMessage('Senha alterada com sucesso!')
            setTimeout(() => router.push('/login'), 3000)
        } catch (err: any) {
            setError(err.message || 'Erro ao alterar senha.')
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
                    <h1 className="text-3xl font-bold text-primary-navy">Nova Senha</h1>
                    <p className="text-gray-600 mt-2">Digite sua nova senha de acesso</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {message ? (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>
                            <p className="text-gray-700 font-medium">{message}</p>
                            <p className="text-sm text-gray-500">Redirecionando para o login...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sua nova senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-cyan outline-none transition-all"
                                        placeholder="No mínimo 6 caracteres"
                                    />
                                </div>
                            </div>

                            {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">{error}</div>}

                            <button
                                type="submit"
                                disabled={loading || password.length < 6}
                                className="w-full bg-primary-cyan text-white py-3 rounded-xl font-semibold hover:bg-primary-cyan/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Atualizar Senha'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
