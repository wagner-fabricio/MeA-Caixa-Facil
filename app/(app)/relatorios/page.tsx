'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Download, BarChart3, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'
import PeriodFilter, { PeriodFilter as PeriodFilterType } from '@/components/period-filter'
import IncomeExpenseChart from '@/components/dashboard/income-expense-chart'
import CategoryBreakdown from '@/components/dashboard/category-breakdown'
import BalanceEvolutionChart from '@/components/dashboard/balance-evolution-chart'

interface Transaction {
    id: string
    type: 'income' | 'expense'
    amount: number
    date: string
    description: string
    category: string
}

export default function ReportsPage() {
    const supabase = createClient()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [businessId, setBusinessId] = useState<string | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [periodFilter, setPeriodFilter] = useState<PeriodFilterType>({
        type: 'month',
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    })

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
        const loadData = async () => {
            try {
                const bizResponse = await fetch('/api/businesses')
                const bizData = await bizResponse.json()

                if (bizData.businesses && bizData.businesses.length > 0) {
                    const businessId = bizData.businesses[0].id
                    setBusinessId(businessId)
                    await loadTransactions(businessId)
                } else {
                    router.push('/onboarding')
                }
            } catch (error) {
                console.error('Error loading data:', error)
            } finally {
                setLoading(false)
            }
        }

        if (user) {
            loadData()
        }
    }, [user, router])

    const loadTransactions = async (bizId: string) => {
        try {
            const response = await fetch(`/api/transactions?businessId=${bizId}`)
            const { transactions } = await response.json()
            setTransactions(transactions)
        } catch (error) {
            console.error('Error loading transactions:', error)
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
    const totalIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
    const balance = totalIncome - totalExpense

    const downloadReportTXT = () => {
        try {
            const content = `
RELATÓRIO FINANCEIRO
=====================
Período: ${new Date(periodFilter.startDate || '').toLocaleDateString('pt-BR')} a ${new Date(periodFilter.endDate || '').toLocaleDateString('pt-BR')}

RESUMO
------
Total de Receitas: R$ ${totalIncome.toFixed(2)}
Total de Despesas: R$ ${totalExpense.toFixed(2)}
Saldo: R$ ${balance.toFixed(2)}

DETALHES DAS TRANSAÇÕES
------------------------
${filteredTransactions
    .map(
        tx => 
            `[${new Date(tx.date).toLocaleDateString('pt-BR')}] ${tx.type === 'income' ? '+' : '-'} R$ ${tx.amount.toFixed(2)} - ${tx.description} (${tx.category})`
    )
    .join('\n')}
            `

            const blob = new Blob([content], { type: 'text/plain' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `relatorio_${new Date().toISOString().split('T')[0]}.txt`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (err) {
            console.error('Error downloading report:', err)
        }
    }

    const downloadReportCSV = () => {
        try {
            const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']
            const rows = filteredTransactions.map(tx => [
                new Date(tx.date).toLocaleDateString('pt-BR'),
                tx.description,
                tx.category,
                tx.type === 'income' ? 'Receita' : 'Despesa',
                tx.amount.toFixed(2)
            ])

            const csvContent = [
                headers.join(','),
                '',
                'RESUMO',
                `Total de Receitas,R$ ${totalIncome.toFixed(2)}`,
                `Total de Despesas,R$ ${totalExpense.toFixed(2)}`,
                `Saldo,R$ ${balance.toFixed(2)}`,
                '',
                'DETALHES DAS TRANSAÇÕES',
                ...rows.map(row => row.join(','))
            ].join('\n')

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `relatorio_${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (err) {
            console.error('Error downloading report:', err)
        }
    }

    const downloadReportXML = () => {
        try {
            let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n'
            xmlContent += '<relatorio>\n'
            xmlContent += '  <periodo>\n'
            xmlContent += `    <dataInicio>${periodFilter.startDate}</dataInicio>\n`
            xmlContent += `    <dataFim>${periodFilter.endDate}</dataFim>\n`
            xmlContent += '  </periodo>\n'
            xmlContent += '  <resumo>\n'
            xmlContent += `    <totalReceitas>${totalIncome.toFixed(2)}</totalReceitas>\n`
            xmlContent += `    <totalDespesas>${totalExpense.toFixed(2)}</totalDespesas>\n`
            xmlContent += `    <saldo>${balance.toFixed(2)}</saldo>\n`
            xmlContent += '  </resumo>\n'
            xmlContent += '  <transacoes>\n'

            filteredTransactions.forEach(tx => {
                xmlContent += '    <transacao>\n'
                xmlContent += `      <data>${tx.date}</data>\n`
                xmlContent += `      <descricao>${tx.description}</descricao>\n`
                xmlContent += `      <categoria>${tx.category}</categoria>\n`
                xmlContent += `      <tipo>${tx.type}</tipo>\n`
                xmlContent += `      <valor>${tx.amount.toFixed(2)}</valor>\n`
                xmlContent += '    </transacao>\n'
            })

            xmlContent += '  </transacoes>\n'
            xmlContent += '</relatorio>'

            const blob = new Blob([xmlContent], { type: 'application/xml' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `relatorio_${new Date().toISOString().split('T')[0]}.xml`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (err) {
            console.error('Error downloading report:', err)
        }
    }

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
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-primary-navy dark:text-white mb-2">Relatórios</h1>
                            <p className="text-gray-600 dark:text-gray-400">Análise detalhada de suas finanças</p>
                        </div>
                        <div className="relative group">
                            <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-cyan text-primary-navy rounded-xl font-bold hover:bg-primary-cyan/90 transition-all shadow-lg active:scale-95">
                                <Download className="w-5 h-5" />
                                Exportar
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <button
                                    onClick={downloadReportTXT}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white font-medium text-sm border-b border-gray-100 dark:border-gray-800 first:rounded-t-lg flex items-center gap-2 transition-colors"
                                >
                                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">TXT</span>
                                    Texto Simples
                                </button>
                                <button
                                    onClick={downloadReportCSV}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white font-medium text-sm border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 transition-colors"
                                >
                                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">CSV</span>
                                    Planilha Excel
                                </button>
                                <button
                                    onClick={downloadReportXML}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white font-medium text-sm last:rounded-b-lg flex items-center gap-2 transition-colors"
                                >
                                    <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">XML</span>
                                    Marcação XML
                                </button>
                            </div>
                        </div>
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

                {/* Summary Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* Income */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800"
                    >
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Receitas</p>
                        <p className="text-3xl font-black text-semantic-income font-mono">
                            R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </motion.div>

                    {/* Expenses */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800"
                    >
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Despesas</p>
                        <p className="text-3xl font-black text-semantic-expense font-mono">
                            R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </motion.div>

                    {/* Balance */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className={`rounded-2xl shadow-xl p-6 border ${
                            balance >= 0
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900'
                        }`}
                    >
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Saldo Líquido</p>
                        <p className={`text-3xl font-black font-mono ${
                            balance >= 0 ? 'text-semantic-income' : 'text-semantic-expense'
                        }`}>
                            R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </motion.div>
                </div>

                {/* Charts */}
                {filteredTransactions.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <IncomeExpenseChart transactions={filteredTransactions} />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <CategoryBreakdown transactions={filteredTransactions} type="expense" />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="md:col-span-2"
                        >
                            <BalanceEvolutionChart transactions={filteredTransactions} />
                        </motion.div>
                    </div>
                )}

                {/* Transaction List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-800"
                >
                    <h2 className="text-xl font-bold text-primary-navy dark:text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Detalhes das Transações
                    </h2>

                    {filteredTransactions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Data</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Descrição</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Categoria</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Valor</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Tipo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.map((tx) => (
                                        <tr key={tx.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                                {new Date(tx.date).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                                                {tx.description}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                                {tx.category}
                                            </td>
                                            <td className={`py-3 px-4 text-right font-bold font-mono ${
                                                tx.type === 'income' ? 'text-semantic-income' : 'text-semantic-expense'
                                            }`}>
                                                {tx.type === 'income' ? '+' : '-'} R$ {tx.amount.toFixed(2)}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                                    tx.type === 'income'
                                                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                                        : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                                }`}>
                                                    {tx.type === 'income' ? 'Receita' : 'Despesa'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">
                                Nenhuma transação no período selecionado
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
