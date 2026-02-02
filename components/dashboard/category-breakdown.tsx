'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface Transaction {
    category: string
    amount: number
    type: string
}

interface CategoryBreakdownProps {
    transactions: Transaction[]
    type: 'income' | 'expense'
}

const COLORS = ['#00D4FF', '#1E3A5F', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function CategoryBreakdown({ transactions, type }: CategoryBreakdownProps) {
    const categoryData = transactions
        .filter(t => t.type === type)
        .reduce((acc, t) => {
            const existing = acc.find(item => item.name === t.category)
            if (existing) {
                existing.value += t.amount
            } else {
                acc.push({ name: t.category, value: t.amount })
            }
            return acc
        }, [] as { name: string; value: number }[])
        .sort((a, b) => b.value - a.value)
        .slice(0, 7) // Top 7 categories

    const total = categoryData.reduce((sum, item) => sum + item.value, 0)

    if (categoryData.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-primary-navy mb-4">
                    {type === 'income' ? 'Entradas' : 'Saídas'} por Categoria
                </h3>
                <div className="text-center py-12 text-gray-500">
                    Nenhuma transação registrada
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-primary-navy mb-4">
                {type === 'income' ? 'Entradas' : 'Saídas'} por Categoria
            </h3>

            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${percent !== undefined ? (percent * 100).toFixed(0) : '0'}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px',
                        }}
                        formatter={(value: number | undefined) => value !== undefined ? `R$ ${value.toFixed(2)}` : 'N/A'}
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* Category List */}
            <div className="mt-6 space-y-2">
                {categoryData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm text-gray-700">{item.name}</span>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">
                                R$ {item.value.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                                {((item.value / total) * 100).toFixed(1)}%
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
