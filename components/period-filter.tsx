'use client'

import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

export interface PeriodFilter {
    type: 'today' | 'week' | 'month' | 'year' | 'custom'
    startDate?: string
    endDate?: string
}

interface PeriodFilterProps {
    onFilterChange: (filter: PeriodFilter) => void
    currentFilter: PeriodFilter
}

export default function PeriodFilter({ onFilterChange, currentFilter }: PeriodFilterProps) {
    const [showCustom, setShowCustom] = useState(currentFilter.type === 'custom')

    const getPeriodDates = (type: 'today' | 'week' | 'month' | 'year') => {
        const today = new Date()
        const startDate = new Date()

        switch (type) {
            case 'today':
                startDate.setHours(0, 0, 0, 0)
                break
            case 'week':
                startDate.setDate(today.getDate() - today.getDay())
                startDate.setHours(0, 0, 0, 0)
                break
            case 'month':
                startDate.setDate(1)
                startDate.setHours(0, 0, 0, 0)
                break
            case 'year':
                startDate.setMonth(0)
                startDate.setDate(1)
                startDate.setHours(0, 0, 0, 0)
                break
        }

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0],
        }
    }

    const handlePresetClick = (type: 'today' | 'week' | 'month' | 'year') => {
        const { startDate, endDate } = getPeriodDates(type)
        onFilterChange({
            type,
            startDate,
            endDate,
        })
        setShowCustom(false)
    }

    const handleCustomChange = (startDate: string, endDate: string) => {
        onFilterChange({
            type: 'custom',
            startDate,
            endDate,
        })
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-cyan" />
                    Filtro de Período
                </h3>

                <div className="flex flex-wrap gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePresetClick('today')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            currentFilter.type === 'today'
                                ? 'bg-primary-navy text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        Hoje
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePresetClick('week')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            currentFilter.type === 'week'
                                ? 'bg-primary-navy text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        Esta Semana
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePresetClick('month')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            currentFilter.type === 'month'
                                ? 'bg-primary-navy text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        Este Mês
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePresetClick('year')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            currentFilter.type === 'year'
                                ? 'bg-primary-navy text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        Este Ano
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCustom(!showCustom)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            currentFilter.type === 'custom'
                                ? 'bg-primary-navy text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        Personalizado
                    </motion.button>
                </div>
            </div>

            {/* Custom Date Range */}
            {showCustom && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row gap-4"
                >
                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Data Inicial
                        </label>
                        <input
                            type="date"
                            value={currentFilter.startDate || ''}
                            onChange={(e) => handleCustomChange(e.target.value, currentFilter.endDate || '')}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 outline-none dark:text-white"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Data Final
                        </label>
                        <input
                            type="date"
                            value={currentFilter.endDate || ''}
                            onChange={(e) => handleCustomChange(currentFilter.startDate || '', e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 outline-none dark:text-white"
                        />
                    </div>
                </motion.div>
            )}
        </div>
    )
}
