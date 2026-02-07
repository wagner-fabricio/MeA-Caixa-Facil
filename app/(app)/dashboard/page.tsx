'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Plus, LogOut, Edit3, Trash2 } from 'lucide-react'
import ConfirmDialog from '@/components/confirm-dialog'
import { motion } from 'framer-motion'
import TransactionInput from '@/components/transaction-input'
import IncomeExpenseChart from '@/components/dashboard/income-expense-chart'
import CategoryBreakdown from '@/components/dashboard/category-breakdown'
import BalanceEvolutionChart from '@/components/dashboard/balance-evolution-chart'
import AlertBanner from '@/components/alert-banner'

interface DashboardData {
    balance: number
    todayIncome: number
    todayExpense: number
    transactions: Transaction[]
    allTransactions: Transaction[]
}

interface Transaction {
    id: string
    type: 'income' | 'expense'
    amount: number
    date: string
    description: string
    category: string
}

interface Alert {
    id: string
    type: string
    message: string
    severity: 'info' | 'warning' | 'critical'
    isRead: boolean
}

export default function DashboardPage() {
    const supabase = createClient()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [businessId, setBusinessId] = useState<string | null>(null)
    const [data, setData] = useState<DashboardData | null>(null)
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [loading, setLoading] = useState(true)
    const [showInput, setShowInput] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [edited, setEdited] = useState<any>(null)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [pendingDelete, setPendingDelete] = useState<any>(null)
    const [undoToast, setUndoToast] = useState<any>(null)

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser()
            if (!currentUser) {
                router.push('/login')
                return
            }
            setUser(currentUser)
        }
        checkUser()
    }, [router, supabase])

    useEffect(() => {
        const loadBusinessAndData = async () => {
            try {
                // Get user's first business
                const bizResponse = await fetch('/api/businesses')
                const bizData = await bizResponse.json()

                if (bizData.businesses && bizData.businesses.length > 0) {
                    const firstBusiness = bizData.businesses[0]
                    setBusinessId(firstBusiness.id)
                    await loadDashboardData(firstBusiness.id)
                    await loadAlerts(firstBusiness.id)
                } else {
                    router.push('/onboarding')
                }
            } catch (error) {
                console.error('Error loading business:', error)
            } finally {
                setLoading(false)
            }
        }

        if (user) {
            loadBusinessAndData()
        }
    }, [user, router])



    const loadDashboardData = async (bizId: string) => {
        try {
            // Get last 30 days for charts
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

            const response = await fetch(
                `/api/transactions?businessId=${bizId}&startDate=${thirtyDaysAgo.toISOString()}`
            )
            const { transactions } = await response.json()

            // Today's data
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const todayTransactions = transactions.filter((t: Transaction) => {
                const tDate = new Date(t.date)
                tDate.setHours(0, 0, 0, 0)
                return tDate.getTime() === today.getTime()
            })

            const todayIncome = todayTransactions
                .filter((t: Transaction) => t.type === 'income')
                .reduce((sum: number, t: Transaction) => sum + t.amount, 0)

            const todayExpense = todayTransactions
                .filter((t: Transaction) => t.type === 'expense')
                .reduce((sum: number, t: Transaction) => sum + t.amount, 0)

            setData({
                balance: todayIncome - todayExpense,
                todayIncome,
                todayExpense,
                transactions: todayTransactions,
                allTransactions: transactions,
            })
        } catch (error) {
            console.error('Error loading dashboard data:', error)
        }
    }

    const loadAlerts = async (bizId: string) => {
        try {
            // Generate new alerts
            await fetch('/api/alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessId: bizId }),
            })

            // Fetch alerts
            const response = await fetch(`/api/alerts?businessId=${bizId}`)
            const { alerts: fetchedAlerts } = await response.json()
            setAlerts(fetchedAlerts)
        } catch (error) {
            console.error('Error loading alerts:', error)
        }
    }

    const dismissAlert = async (alertId: string) => {
        try {
            await fetch('/api/alerts', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ alertId }),
            })
            setAlerts(alerts.filter(a => a.id !== alertId))
        } catch (error) {
            console.error('Error dismissing alert:', error)
        }
    }

    if (loading || !user) {
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
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold tracking-tight text-primary-navy dark:text-white">
                        M&A <span className="text-primary-cyan">Caixa Fácil</span>
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 hidden md:inline">Olá, {user.user_metadata?.name || user.email}</span>
                        <button
                            onClick={async () => {
                                await supabase.auth.signOut()
                                router.push('/')
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-navy dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all border border-gray-200 dark:border-gray-700 shadow-sm active:scale-95"
                            title="Sair"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Sair</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Alerts */}
                <AlertBanner alerts={alerts} onDismiss={dismissAlert} />

                {/* Summary Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* Balance */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-primary-navy/5 p-6 border border-gray-100 dark:border-gray-800"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-primary-navy/10 dark:bg-primary-navy/20 rounded-xl flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-primary-navy dark:text-primary-cyan" />
                            </div>
                            <span className="text-gray-500 dark:text-gray-400 font-semibold text-sm uppercase tracking-wider">Saldo do Dia</span>
                        </div>
                        <p className={`text-4xl font-black font-mono tracking-tighter ${(data?.balance || 0) >= 0 ? 'text-semantic-income' : 'text-semantic-expense'
                            }`}>
                            R$ {(data?.balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </motion.div>

                    {/* Income */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-semantic-income/5 p-6 border border-gray-100 dark:border-gray-800"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-semantic-income/10 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-semantic-income" />
                            </div>
                            <span className="text-gray-500 dark:text-gray-400 font-semibold text-sm uppercase tracking-wider">Entradas Hoje</span>
                        </div>
                        <p className="text-4xl font-black text-semantic-income font-mono tracking-tighter">
                            R$ {(data?.todayIncome || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </motion.div>

                    {/* Expense */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-semantic-expense/5 p-6 border border-gray-100 dark:border-gray-800"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-semantic-expense/10 rounded-xl flex items-center justify-center">
                                <TrendingDown className="w-6 h-6 text-semantic-expense" />
                            </div>
                            <span className="text-gray-500 dark:text-gray-400 font-semibold text-sm uppercase tracking-wider">Saídas Hoje</span>
                        </div>
                        <p className="text-4xl font-black text-semantic-expense font-mono tracking-tighter">
                            R$ {(data?.todayExpense || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </motion.div>
                </div>

                {/* Quick Action Button */}
                {!showInput && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 text-center"
                    >
                        <button
                            onClick={() => setShowInput(true)}
                            className="inline-flex items-center gap-3 px-10 py-5 bg-primary-navy text-white rounded-2xl font-bold text-xl hover:bg-primary-navy/90 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95"
                        >
                            <Plus className="w-8 h-8 text-primary-cyan" />
                            Registrar Transação
                        </button>
                    </motion.div>
                )}

                {/* Transaction Input */}
                {showInput && businessId && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8"
                    >
                        <TransactionInput
                            businessId={businessId}
                            onSuccess={() => {
                                setShowInput(false)
                                loadDashboardData(businessId)
                                loadAlerts(businessId)
                            }}
                        />
                    </motion.div>
                )}

                {/* Charts */}
                {data?.allTransactions && data.allTransactions.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <IncomeExpenseChart transactions={data.allTransactions} />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <CategoryBreakdown transactions={data.allTransactions} type="expense" />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="md:col-span-2"
                        >
                            <BalanceEvolutionChart transactions={data.allTransactions} />
                        </motion.div>
                    </div>
                )}

                {/* Recent Transactions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                >
                    <h2 className="text-xl font-bold text-primary-navy mb-4">Transações de Hoje</h2>
                    {data?.transactions && data.transactions.length > 0 ? (
                        <div className="space-y-3">
                            {data.transactions.map((transaction: any) => (
                                <div
                                    key={transaction.id}
                                    className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors w-full"
                                >
                                    {editingId === transaction.id ? (
                                        <div className="w-full flex flex-col md:flex-row items-start md:items-center gap-3">
                                            <input
                                                className="flex-1 min-w-0 px-3 py-2 rounded-lg border"
                                                value={edited.description}
                                                onChange={(e) => setEdited({ ...edited, description: e.target.value })}
                                            />
                                            <div className="flex gap-2 w-full md:w-auto flex-wrap">
                                                <input
                                                    className="w-full md:w-28 px-3 py-2 rounded-lg border text-right font-mono"
                                                    value={edited.amount}
                                                    onChange={(e) => setEdited({ ...edited, amount: Number(e.target.value) })}
                                                />
                                                <select
                                                    className="w-full md:w-28 px-3 py-2 rounded-lg border"
                                                    value={edited.type}
                                                    onChange={(e) => setEdited({ ...edited, type: e.target.value })}
                                                >
                                                    <option value="income">Entrada</option>
                                                    <option value="expense">Saída</option>
                                                </select>
                                                <input
                                                    className="flex-1 md:w-36 px-3 py-2 rounded-lg border"
                                                    value={edited.category}
                                                    onChange={(e) => setEdited({ ...edited, category: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const res = await fetch('/api/transactions', {
                                                                method: 'PATCH',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({
                                                                    id: transaction.id,
                                                                    amount: Number(edited.amount),
                                                                    description: edited.description,
                                                                    category: edited.category,
                                                                    type: edited.type,
                                                                }),
                                                            })
                                                            if (!res.ok) throw new Error('Erro')
                                                            setEditingId(null)
                                                            await loadDashboardData(businessId!)
                                                        } catch (err) {
                                                            console.error(err)
                                                        }
                                                    }}
                                                    className="px-3 py-2 bg-primary-navy text-white rounded-lg"
                                                >Salvar</button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="px-3 py-2 bg-gray-200 rounded-lg"
                                                >Cancelar</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 w-full">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">{transaction.description}</p>
                                                <p className="text-sm text-gray-500 truncate">{transaction.category}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className={`text-xl font-bold font-mono ${transaction.type === 'income' ? 'text-semantic-income' : 'text-semantic-expense'
                                                        }`}>
                                                        {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(transaction.date).toLocaleTimeString('pt-BR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(transaction.id)
                                                            setEdited({
                                                                description: transaction.description,
                                                                amount: transaction.amount,
                                                                category: transaction.category,
                                                                type: transaction.type,
                                                            })
                                                        }}
                                                        className="p-2 rounded-lg hover:bg-gray-100"
                                                        title="Editar"
                                                    >
                                                        <Edit3 className="w-4 h-4 text-gray-600" />
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            setPendingDelete(transaction)
                                                            setConfirmOpen(true)
                                                        }}
                                                        className="p-2 rounded-lg hover:bg-gray-100"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">Nenhuma transação registrada hoje</p>
                            <button
                                onClick={() => setShowInput(true)}
                                className="text-primary-cyan font-semibold hover:underline"
                            >
                                Registrar primeira transação
                            </button>
                        </div>
                    )}
                </motion.div>
                <ConfirmDialog
                    open={confirmOpen}
                    title="Excluir transação"
                    message="Deseja realmente excluir esta transação?"
                    confirmLabel="Excluir"
                    cancelLabel="Cancelar"
                    onCancel={() => { setConfirmOpen(false); setPendingDelete(null) }}
                    onConfirm={async () => {
                        if (!pendingDelete) return
                        try {
                            // perform delete
                            const res = await fetch('/api/transactions', {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: pendingDelete.id }),
                            })
                            if (!res.ok) throw new Error('Erro')

                            // store deleted tx for undo
                            setUndoToast({ tx: pendingDelete })

                            // hide modal
                            setConfirmOpen(false)
                            setPendingDelete(null)

                            // reload data
                            if (businessId) await loadDashboardData(businessId)

                            // auto-dismiss toast after 8s
                            setTimeout(() => setUndoToast(null), 8000)
                        } catch (err) {
                            console.error(err)
                            setConfirmOpen(false)
                            setPendingDelete(null)
                        }
                    }}
                />

                {/* Undo toast */}
                {undoToast && (
                    <div className="fixed right-4 bottom-4 z-50 bg-white dark:bg-gray-900 border rounded-lg shadow-lg p-4 flex items-center gap-4">
                        <div className="flex-1 text-sm">Transação excluída</div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={async () => {
                                    try {
                                        const tx = undoToast.tx
                                        const res = await fetch('/api/transactions/restore', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                type: tx.type,
                                                amount: tx.amount,
                                                description: tx.description,
                                                category: tx.category,
                                                method: tx.method,
                                                businessId: tx.businessId,
                                                date: tx.date,
                                            }),
                                        })
                                        if (!res.ok) throw new Error('Erro')
                                        setUndoToast(null)
                                        if (businessId) await loadDashboardData(businessId)
                                    } catch (err) {
                                        console.error(err)
                                    }
                                }}
                                className="px-3 py-1 bg-primary-navy text-white rounded-md text-sm"
                            >Desfazer</button>
                            <button onClick={() => setUndoToast(null)} className="px-2 py-1 text-sm text-gray-500">Fechar</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
