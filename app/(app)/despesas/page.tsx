'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppContext } from '@/lib/context/app-context'
import { Plus, Edit3, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import ExpenseModal from '@/components/expense-modal'
import PeriodFilter, { PeriodFilter as PeriodFilterType } from '@/components/period-filter'
import ConfirmDialog from '@/components/confirm-dialog'

interface Transaction {
    id: string
    type: 'income' | 'expense'
    amount: number
    date: string
    description: string
    category: string
}

export default function ExpensesPage() {
    const router = useRouter()
    const { user, business, loading } = useAppContext()
    const [businessId, setBusinessId] = useState<string | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    
    const [showModal, setShowModal] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [pendingDelete, setPendingDelete] = useState<any>(null)
    const [periodFilter, setPeriodFilter] = useState<PeriodFilterType>({
        type: 'month',
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    })

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [loading, user, router])

    useEffect(() => {
        if (business) {
            setBusinessId(business.id)
            loadTransactions(business.id)
        }
    }, [business])

    const loadTransactions = async (bizId: string) => {
        try {
            const response = await fetch(`/api/transactions?businessId=${bizId}`)
            const { transactions } = await response.json()
            // Filter only expenses
            const expenses = transactions.filter((t: Transaction) => t.type === 'expense')
            setTransactions(expenses)
        } catch (error) {
            console.error('Error loading transactions:', error)
        }
    }

    const handleDelete = async () => {
        if (!pendingDelete) return

        try {
            const res = await fetch('/api/transactions', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: pendingDelete.id }),
            })

            if (!res.ok) throw new Error('Erro ao deletar')

            setConfirmOpen(false)
            setPendingDelete(null)
            if (businessId) await loadTransactions(businessId)
        } catch (err) {
            console.error(err)
        }
    }

    const getFilteredTransactions = () => {
        const startDate = new Date(periodFilter.startDate || '').getTime()
        const endDate = new Date(periodFilter.endDate || '').getTime()

        return transactions.filter(tx => {
            const txDate = new Date(tx.date).getTime()
            return txDate >= startDate && txDate <= endDate
        })
    }

    const filteredTransactions = getFilteredTransactions()
    const totalExpenses = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0)

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-cyan/10 via-white to-primary-navy/5 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-4xl font-bold text-primary-navy dark:text-white mb-2">Despesas</h1>
                            <p className="text-gray-600 dark:text-gray-400">Gerencie todas as suas despesas</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-cyan text-primary-navy rounded-xl font-bold hover:bg-primary-cyan/90 transition-all shadow-lg active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                            Nova Despesa
                        </button>
                    </div>

                    {/* Total Expenses Card */}
                    <div className="bg-gradient-to-br from-semantic-expense/20 to-semantic-expense/5 border border-semantic-expense/30 rounded-2xl p-6">
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Total de Despesas</p>
                        <p className="text-4xl font-black text-semantic-expense font-mono">
                            R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </motion.div>

                {/* Period Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <PeriodFilter
                        currentFilter={periodFilter}
                        onFilterChange={setPeriodFilter}
                    />
                </motion.div>

                {/* Expenses List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-800"
                >
                    {filteredTransactions.length > 0 ? (
                        <div className="space-y-3">
                            {filteredTransactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                                >
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {transaction.description}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="inline-block px-3 py-1 rounded-lg text-xs font-semibold bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                                                {transaction.category}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(transaction.date).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="text-2xl font-bold text-semantic-expense font-mono">
                                            -R$ {transaction.amount.toFixed(2)}
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit3 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setPendingDelete(transaction)
                                                    setConfirmOpen(true)
                                                }}
                                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Deletar"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                Nenhuma despesa no período selecionado
                            </p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="text-primary-cyan font-semibold hover:underline"
                            >
                                Registrar primeira despesa
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Expense Modal */}
            {businessId && (
                <ExpenseModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    businessId={businessId}
                    onSuccess={() => {
                        loadTransactions(businessId)
                    }}
                />
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={confirmOpen}
                title="Excluir Despesa"
                message="Deseja realmente excluir esta despesa?"
                confirmLabel="Excluir"
                cancelLabel="Cancelar"
                onCancel={() => {
                    setConfirmOpen(false)
                    setPendingDelete(null)
                }}
                onConfirm={handleDelete}
            />
        </div>
    )
}
