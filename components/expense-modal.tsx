'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { apiClient } from '@/lib/api/client'
import { logger } from '@/lib/logger'
import type { Category, Account, ExpenseFormData } from '@/types'

export default function ExpenseModal({ isOpen, onClose, businessId, onSuccess }: any) {
    const loadCategories = useCallback(async () => {
        try {
            const data = await apiClient.getCategories(businessId)
            setCategories(data)
        } catch (err) {
            logger.error('Erro ao carregar categorias', err instanceof Error ? err : new Error(String(err)))
            setError('Erro ao carregar categorias')
        }
    }, [businessId])

    const loadAccounts = useCallback(async () => {
        try {
            const data = await apiClient.getAccounts(businessId)
            setAccounts(data)
        } catch (err) {
            logger.error('Erro ao carregar contas', err instanceof Error ? err : new Error(String(err)))
            setError('Erro ao carregar contas')
        }
    }, [businessId])

    const [formData, setFormData] = useState<ExpenseFormData>({
        valor: '',
        data: new Date().toISOString().split('T')[0],
        tipo: 'expense',
        categoria: '',
        conta: '',
        descricao: '',
    })
    const [categories, setCategories] = useState<Category[]>([])
    const [accounts, setAccounts] = useState<Account[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    
    useEffect(() => {
        if (isOpen) {
            loadCategories()
            loadAccounts()
        }
    }, [isOpen, businessId, loadCategories, loadAccounts])

    const handleInputChange = (field: keyof ExpenseFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
        setError('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validação básica
        if (!formData.valor || !formData.categoria || !formData.conta) {
            setError('Preenchimento dos campos Valor, Categoria e Conta é obrigatório')
            return
        }

        const amount = parseFloat(formData.valor)

        // Validação de valores negativos
        if (amount <= 0 || isNaN(amount)) {
            setError('O valor deve ser um número maior que zero')
            return
        }

        setLoading(true)
        setError('')

        try {
            await apiClient.createTransaction({
                input: `${formData.descricao || formData.categoria} ${formData.valor}`,
                businessId,
                method: 'manual'
            })

            // Reset form and close
            setFormData({
                valor: '',
                data: new Date().toISOString().split('T')[0],
                tipo: 'expense',
                categoria: '',
                conta: '',
                descricao: '',
            })
            onSuccess?.()
            onClose()
            logger.info('Transação criada com sucesso')
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao salvar transação'
            setError(message)
            logger.error('Erro ao criar transação', err instanceof Error ? err : new Error(String(err)))
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/50"
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 md:p-8"
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl md:text-3xl font-bold text-primary-navy dark:text-white mb-6 tracking-tight">
                    {formData.tipo === 'expense' ? 'Registrar Despesa' : 'Registrar Receita'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Valor */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Valor (R$)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.valor}
                            onChange={(e) => handleInputChange('valor', e.target.value)}
                            placeholder="0,00"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 outline-none transition-all dark:text-white"
                        />
                    </div>

                    {/* Data */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Data
                        </label>
                        <input
                            type="date"
                            value={formData.data}
                            onChange={(e) => handleInputChange('data', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 outline-none transition-all dark:text-white"
                        />
                    </div>

                    {/* Tipo */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Tipo
                        </label>
                        <select
                            value={formData.tipo}
                            onChange={(e) => handleInputChange('tipo', e.target.value as 'income' | 'expense')}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 outline-none transition-all dark:text-white"
                        >
                            <option value="expense">Variável</option>
                            <option value="income">Receita</option>
                        </select>
                    </div>

                    {/* Categoria */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Categoria
                        </label>
                        <select
                            value={formData.categoria}
                            onChange={(e) => handleInputChange('categoria', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 outline-none transition-all dark:text-white"
                        >
                            <option value="">Selecione a categoria</option>
                            {categories.map((cat: any) => (
                                <option key={cat.id} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Conta */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Conta
                        </label>
                        <select
                            value={formData.conta}
                            onChange={(e) => handleInputChange('conta', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 outline-none transition-all dark:text-white"
                        >
                            <option value="">Selecione a conta</option>
                            {accounts.map((acc: any) => (
                                <option key={acc.id} value={acc.name}>
                                    {acc.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Descrição (opcional)
                        </label>
                        <textarea
                            value={formData.descricao}
                            onChange={(e) => handleInputChange('descricao', e.target.value)}
                            placeholder="Ex: Compra de shampoo profissional"
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 outline-none transition-all resize-none dark:text-white"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Botões */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-primary-navy text-white rounded-xl font-semibold hover:bg-primary-navy/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Registrar {formData.tipo === 'expense' ? 'Despesa' : 'Receita'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
