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
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-primary-navy">Entradas vs Saídas</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPeriod('day')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === 'day'
                            ? 'bg-primary-cyan text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Dia
                    </button>
                    <button
                        onClick={() => setPeriod('week')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === 'week'
                            ? 'bg-primary-cyan text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Semana
                    </button>
                    <button
                        onClick={() => setPeriod('month')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === 'month'
                            ? 'bg-primary-cyan text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Mês
                    </button>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px',
                        }}
                        formatter={(value: number | undefined) => value !== undefined ? `R$ ${value.toFixed(2)}` : 'N/A'}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
                        formatter={(value) => (value === 'income' ? 'Entradas' : 'Saídas')}
                    />
                    <Bar dataKey="income" fill="#10B981" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="expense" fill="#EF4444" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
