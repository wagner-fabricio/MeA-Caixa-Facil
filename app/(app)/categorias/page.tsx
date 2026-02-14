'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Plus, Edit3, Trash2, Tag } from 'lucide-react'
import { motion } from 'framer-motion'
import ConfirmDialog from '@/components/confirm-dialog'

interface Category {
    id: string
    name: string
    type?: string
    color?: string
    icon?: string
}

export default function CategoriesPage() {
    const supabase = createClient()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [businessId, setBusinessId] = useState<string | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [pendingDelete, setPendingDelete] = useState<any>(null)
    const [formData, setFormData] = useState({ name: '', type: 'expense', color: '#FF6B6B' })

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2']

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
                    await loadCategories(businessId)
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

    const loadCategories = async (bizId: string) => {
        try {
            const response = await fetch(`/api/categories?businessId=${bizId}`)
            if (response.ok) {
                const data = await response.json()
                setCategories(data.categories || [])
            }
        } catch (error) {
            console.error('Error loading categories:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name) return

        try {
            if (editingId) {
                // Update
                await fetch('/api/categories', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: editingId,
                        name: formData.name,
                        type: formData.type,
                        color: formData.color,
                    }),
                })
            } else {
                // Create
                await fetch('/api/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        type: formData.type,
                        color: formData.color,
                        businessId,
                    }),
                })
            }

            setFormData({ name: '', type: 'expense', color: '#FF6B6B' })
            setEditingId(null)
            setShowForm(false)
            if (businessId) await loadCategories(businessId)
        } catch (err) {
            console.error(err)
        }
    }

    const handleDelete = async () => {
        if (!pendingDelete) return

        try {
            await fetch('/api/categories', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: pendingDelete.id }),
            })

            setConfirmOpen(false)
            setPendingDelete(null)
            if (businessId) await loadCategories(businessId)
        } catch (err) {
            console.error(err)
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
                            <h1 className="text-4xl font-bold text-primary-navy dark:text-white mb-2">Categorias</h1>
                            <p className="text-gray-600 dark:text-gray-400">Organize suas despesas por categorias</p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingId(null)
                                setFormData({ name: '', type: 'expense', color: '#FF6B6B' })
                                setShowForm(!showForm)
                            }}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-cyan text-primary-navy rounded-xl font-bold hover:bg-primary-cyan/90 transition-all shadow-lg active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                            Nova Categoria
                        </button>
                    </div>
                </motion.div>

                {/* Form */}
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800"
                    >
                        <h2 className="text-2xl font-bold mb-4">{editingId ? 'Editar' : 'Nova'} Categoria</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Nome da Categoria</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Alimentação"
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 outline-none dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Tipo</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 outline-none dark:text-white"
                                    >
                                        <option value="expense">Despesa</option>
                                        <option value="income">Receita</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-3">Cor</label>
                                <div className="flex flex-wrap gap-3">
                                    {colors.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color })}
                                            className={`w-10 h-10 rounded-lg transition-transform ${
                                                formData.color === color ? 'ring-2 ring-offset-2 ring-primary-navy scale-110' : ''
                                            }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-primary-navy text-white rounded-lg font-semibold hover:bg-primary-navy/90 transition-colors"
                                >
                                    Salvar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Categories Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {categories.length > 0 ? (
                        categories.map((category) => (
                            <div
                                key={category.id}
                                className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-lg hover:shadow-xl transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div
                                            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: category.color || '#FF6B6B', opacity: 0.2 }}
                                        >
                                            <Tag
                                                className="w-6 h-6"
                                                style={{ color: category.color || '#FF6B6B' }}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{category.name}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                {category.type === 'expense' ? 'Despesa' : 'Receita'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingId(category.id)
                                            setFormData({
                                                name: category.name,
                                                type: category.type || 'expense',
                                                color: category.color || '#FF6B6B',
                                            })
                                            setShowForm(true)
                                        }}
                                        className="flex-1 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        <span className="text-sm">Editar</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setPendingDelete(category)
                                            setConfirmOpen(true)
                                        }}
                                        className="flex-1 p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                        <span className="text-sm text-red-600">Deletar</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhuma categoria cadastrada</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="text-primary-cyan font-semibold hover:underline"
                            >
                                Registrar primeira categoria
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={confirmOpen}
                title="Excluir Categoria"
                message="Deseja realmente excluir esta categoria?"
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
