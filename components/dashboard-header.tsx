'use client'

import { motion } from 'framer-motion'
import { Building2 } from 'lucide-react'
import { useAppContext } from '@/lib/context/app-context'
import type { DashboardHeaderProps } from '@/types'

export default function DashboardHeader({ userName, businessName }: DashboardHeaderProps) {
    const { user, business } = useAppContext()

    const displayName = userName || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário'
    const displayBusiness = businessName || business?.name || 'Seu Negócio'

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-primary-navy via-primary-navy to-primary-cyan dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 rounded-3xl shadow-2xl p-8 md:p-10 mb-8 border border-primary-cyan/20"
        >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                {/* Left side - User greeting */}
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-primary-cyan/20 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-primary-cyan/30">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-cyan to-primary-navy rounded-xl flex items-center justify-center">
                            <span className="text-xl font-bold text-white">
                                {displayName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-primary-cyan/80 uppercase tracking-widest">Bem-vindo(a)</p>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
                            {displayName}
                        </h1>
                        <p className="text-base text-primary-cyan/70 font-medium">Gerencie seu negócio com inteligência</p>
                    </div>
                </div>

                {/* Right side - Business info */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="bg-white/10 dark:bg-gray-800/30 backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-gray-700/30"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary-cyan/20 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-primary-cyan" />
                        </div>
                        <span className="text-xs font-semibold text-primary-cyan/70 uppercase tracking-wider">Negócio</span>
                    </div>
                    <p className="text-lg md:text-xl font-bold text-white mb-1">
                        {displayBusiness}
                    </p>
                    <p className="text-xs text-primary-cyan/60">
                        {new Date().toLocaleDateString('pt-BR', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </motion.div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary-cyan/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-cyan/5 rounded-full -ml-16 -mb-16 blur-3xl pointer-events-none" />
        </motion.div>
    )
}
