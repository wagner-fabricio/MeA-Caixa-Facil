'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { Briefcase, Loader2, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const BUSINESS_TYPES = [
    { value: 'barbershop', label: '💈 Barbearia', icon: '💈' },
    { value: 'salon', label: '💅 Salão de Beleza', icon: '💅' },
    { value: 'workshop', label: '🔧 Oficina', icon: '🔧' },
    { value: 'retail', label: '🛒 Comércio', icon: '🛒' },
    { value: 'other', label: '📋 Outro', icon: '📋' },
]

export default function OnboardingPage() {
    const router = useRouter()
    const supabase = createClient()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        businessName: '',
        businessType: 'barbershop',
    })

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // Check if they already have a business
            const response = await fetch('/api/businesses')
            const data = await response.json()

            if (data.businesses && data.businesses.length > 0) {
                router.push('/dashboard')
                return
            }

            setUser(user)
            setLoading(false)
        }
        checkUser()
    }, [router, supabase])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: user.user_metadata?.name || user.email.split('@')[0],
                    email: user.email,
                    password: 'google-auth-no-password', // Placeholder
                    businessName: formData.businessName,
                    businessType: formData.businessType,
                    supabaseId: user.id
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Erro ao criar seu negócio')
            }

            router.push('/dashboard')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary-cyan" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-cyan/10 via-white to-primary-navy/5 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg"
            >
                {/* Logo & Welcome */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/logo.svg"
                            alt="M&A Caixa Fácil"
                            width={60}
                            height={60}
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-primary-navy">
                        Olá! Vamos configurar seu caixa?
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Só precisamos de alguns detalhes sobre o seu negócio.
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Business Name */}
                        <div>
                            <label htmlFor="businessName" className="block text-sm font-semibold text-gray-700 mb-3">
                                Qual o nome do seu negócio?
                            </label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="businessName"
                                    type="text"
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-cyan/10 focus:border-primary-cyan focus:bg-white outline-none transition-all text-lg"
                                    placeholder="Ex: Barbearia Luxo, Oficina Central..."
                                    required
                                />
                            </div>
                        </div>

                        {/* Business Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Qual a sua área de atuação?
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {BUSINESS_TYPES.map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, businessType: type.value })}
                                        className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${formData.businessType === type.value
                                                ? 'border-primary-cyan bg-primary-cyan/5 ring-4 ring-primary-cyan/10 shadow-sm'
                                                : 'border-gray-50 bg-gray-50 hover:border-gray-200 hover:bg-gray-100'
                                            }`}
                                    >
                                        <span className="text-2xl">{type.icon}</span>
                                        <span className={`font-semibold text-sm ${formData.businessType === type.value ? 'text-primary-navy' : 'text-gray-600'
                                            }`}>
                                            {type.label.split(' ').slice(1).join(' ')}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Error Message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitting || !formData.businessName}
                            className="w-full bg-primary-navy text-white py-5 rounded-2xl font-bold text-xl hover:bg-primary-navy/90 transition-all shadow-xl hover:shadow-cyan-500/10 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Configurando...
                                </>
                            ) : (
                                <>
                                    Começar a usar
                                    <ArrowRight className="w-6 h-6 text-primary-cyan" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-gray-500 mt-8">
                    Você poderá alterar essas informações e adicionar outros negócios depois.
                </p>
            </motion.div>
        </div>
    )
}
