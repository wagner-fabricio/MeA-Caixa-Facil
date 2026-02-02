'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useState } from 'react'

interface Transaction {
    id: string
    type: string
    amount: number
    date: string
}

interface BalanceEvolutionChartProps {
    transactions: Transaction[]
}

export default function BalanceEvolutionChart({ transactions }: BalanceEvolutionChartProps) {
    // Process data to calculate cumulative balance day by day
    const processData = () => {
        // Sort transactions by date ascending
        const sortedDetails = [...transactions].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        )

        if (sortedDetails.length === 0) return []

        // Get date range (from first transaction to today)
        const startDate = new Date(sortedDetails[0].date)
        const endDate = new Date()

        // Ensure we show at least last 7 days if not enough data
        if (endDate.getTime() - startDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
            startDate.setDate(endDate.getDate() - 7)
        }

        const data: { date: string; balance: number }[] = []
        let currentBalance = 0

        // iterate through each day
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dayTransactions = sortedDetails.filter(t =>
                new Date(t.date).toDateString() === d.toDateString()
            )

            const dailyChange = dayTransactions.reduce((acc, t) => {
                return acc + (t.type === 'income' ? t.amount : -t.amount)
            }, 0)

            currentBalance += dailyChange

            data.push({
                date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                balance: currentBalance,
            })
        }

        return data
    }

    const chartData = processData()

    if (chartData.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-primary-navy mb-4">Evolução do Saldo</h3>
                <div className="text-center py-12 text-gray-500">
                    Dados insuficientes
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-primary-navy mb-6">Evolução do Saldo</h3>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="date"
                            stroke="#6B7280"
                            style={{ fontSize: '12px' }}
                            tickMargin={10}
                        />
                        <YAxis
                            stroke="#6B7280"
                            style={{ fontSize: '12px' }}
                            tickFormatter={(value) => `R$${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px',
                            }}
                            formatter={(value: number | undefined) => [
                                value !== undefined ? `R$ ${value.toFixed(2)}` : 'N/A',
                                'Saldo Acumulado'
                            ]}
                        />
                        <Area
                            type="monotone"
                            dataKey="balance"
                            stroke="#00D4FF"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorBalance)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
