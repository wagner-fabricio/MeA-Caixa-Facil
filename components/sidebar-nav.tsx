'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LayoutDashboard, TrendingDown, TrendingUp, Wallet, Tag, BarChart3, LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function SidebarNav() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    // Abrir sidebar por padrão em telas maiores (>= md)
    useEffect(() => {
        if (typeof window === 'undefined') return
        const mql = window.matchMedia('(min-width: 768px)')
        const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
            setIsOpen(Boolean((e as any).matches))
        }
        // inicializa conforme o tamanho atual
        setIsOpen(mql.matches)
        if (mql.addEventListener) mql.addEventListener('change', onChange)
        else mql.addListener(onChange)
        return () => {
            if (mql.removeEventListener) mql.removeEventListener('change', onChange)
            else mql.removeListener(onChange)
        }
    }, [])

    const menuItems = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/despesas', label: 'Despesas', icon: TrendingDown },
        { href: '/receitas', label: 'Receitas', icon: TrendingUp },
        { href: '/contas', label: 'Contas', icon: Wallet },
        { href: '/categorias', label: 'Categorias', icon: Tag },
        { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
    ]

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    const isActive = (href: string) => pathname === href

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-primary-navy text-white md:hidden hover:bg-primary-navy/90 transition-colors"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ x: isOpen ? 0 : -280 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed left-0 top-0 h-screen w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-30 md:z-0 md:relative md:translate-x-0 md:h-auto md:w-64 md:border-r md:flex md:flex-col"
            >
                {/* Logo */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <h1 className="text-xl font-bold tracking-tight">
                        <span className="text-primary-navy dark:text-white">M&A</span> <span className="text-primary-cyan">Caixa Fácil</span>
                    </h1>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.href)

                        const handleNavigate = () => {
                            // Only close sidebar automatically on small screens
                            if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
                                setIsOpen(false)
                            }
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={handleNavigate}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                                    active
                                        ? 'bg-primary-navy text-white shadow-lg'
                                        : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        <span>Sair</span>
                    </button>
                </div>
            </motion.aside>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
