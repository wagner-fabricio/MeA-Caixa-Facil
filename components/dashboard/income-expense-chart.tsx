'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useState } from 'react'

interface Transaction {
    id: string
    type: string
    amount: number
    date: string
}

interface IncomeExpenseChartProps {
    transactions: Transaction[]
}

type Period = 'day' | 'week' | 'month'

export default function IncomeExpenseChart({ transactions }: IncomeExpenseChartProps) {
    const [period, setPeriod] = useState<Period>('week')

    const processData = () => {
        const now = new Date()
        const data: { name: string; income: number; expense: number }[] = []

        if (period === 'day') {
            // Last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now)
                date.setDate(date.getDate() - i)
                const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' })

                const dayTransactions = transactions.filter(t => {
                    const tDate = new Date(t.date)
                    return tDate.toDateString() === date.toDateString()
                })

                data.push({
                    name: dayName,
                    income: dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
                    expense: dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
                })
            }
        } else if (period === 'week') {
            // Last 4 weeks
            for (let i = 3; i >= 0; i--) {
                const weekStart = new Date(now)
                weekStart.setDate(weekStart.getDate() - (i * 7 + 7))
                const weekEnd = new Date(weekStart)
                weekEnd.setDate(weekEnd.getDate() + 6)

                const weekTransactions = transactions.filter(t => {
                    const tDate = new Date(t.date)
                    return tDate >= weekStart && tDate <= weekEnd
                })

                data.push({
                    name: `Sem ${4 - i}`,
                    income: weekTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
                    expense: weekTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
                })
            }
        } else {
            // Last 6 months
            for (let i = 5; i >= 0; i--) {
                const month = new Date(now)
                month.setMonth(month.getMonth() - i)
                const monthName = month.toLocaleDateString('pt-BR', { month: 'short' })

                const monthTransactions = transactions.filter(t => {
                    const tDate = new Date(t.date)
                    return tDate.getMonth() === month.getMonth() && tDate.getFullYear() === month.getFullYear()
                })

                data.push({
                    name: monthName,
                    income: monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
                    expense: monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
                })
            }
        }

        return data
    }

    const chartData = processData()

    return (
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-primary-navy/5 p-8 border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h3 className="text-xl font-bold text-primary-navy dark:text-white">Fluxo de Caixa</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Entradas vs Saídas no período</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl">
                    {(['day', 'week', 'month'] as Period[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${period === p
                                ? 'bg-white dark:bg-gray-700 text-primary-navy dark:text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            {p === 'day' ? 'Dia' : p === 'week' ? 'Semana' : 'Mês'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-gray-800" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }}
                        />
                        <Tooltip
                            cursor={{ fill: '#F3F4F6', opacity: 0.4 }}
                            contentStyle={{
                                backgroundColor: '#1E3A5F',
                                border: 'none',
                                borderRadius: '16px',
                                color: '#fff',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                padding: '12px'
                            }}
                            itemStyle={{ color: '#fff', fontWeight: 600 }}
                            labelStyle={{ color: '#00D4FF', fontWeight: 800, marginBottom: '4px' }}
                            formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
                        />
                        <Bar
                            dataKey="income"
                            name="Entradas"
                            fill="#10B981"
                            radius={[6, 6, 0, 0]}
                            barSize={32}
                        />
                        <Bar
                            dataKey="expense"
                            name="Saídas"
                            fill="#EF4444"
                            radius={[6, 6, 0, 0]}
                            barSize={32}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
