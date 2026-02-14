/**
 * Centralized API Client
 * Single source of truth for all API calls
 */

import { z } from 'zod'
import { apiCall, createQueryString } from './fetch-utils'
import type {
    Transaction,
    Category,
    Account,
    Business,
    Alert,
    TransactionsResponse,
    CategoriesResponse,
    AccountsResponse,
    BusinessesResponse,
    AlertsResponse
} from '@/types'

// ============== VALIDATION SCHEMAS ==============

const TransactionSchema = z.object({
    id: z.string(),
    type: z.enum(['income', 'expense']),
    amount: z.number(),
    description: z.string(),
    category: z.string(),
    date: z.string(),
    method: z.enum(['manual', 'voice']).default('manual'),
    businessId: z.string(),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
    deletedAt: z.string().nullable().optional()
})

const TransactionsResponseSchema = z.object({
    transactions: z.array(TransactionSchema)
})

const CategorySchema = z.object({
    id: z.string(),
    businessId: z.string(),
    name: z.string(),
    type: z.enum(['income', 'expense']),
    color: z.string().optional(),
    usageCount: z.number().default(0),
    isDefault: z.boolean().default(false),
    createdAt: z.string(),
    updatedAt: z.string().optional()
})

const CategoriesResponseSchema = z.object({
    categories: z.array(CategorySchema)
})

const AccountSchema = z.object({
    id: z.string(),
    businessId: z.string(),
    name: z.string(),
    type: z.enum(['bank', 'card', 'wallet', 'cash']),
    balance: z.number().default(0),
    createdAt: z.string(),
    updatedAt: z.string().optional()
})

const AccountsResponseSchema = z.object({
    accounts: z.array(AccountSchema)
})

const BusinessSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['barbershop', 'salon', 'workshop', 'retail', 'other']),
    ownerId: z.string(),
    createdAt: z.string(),
    updatedAt: z.string().optional()
})

const BusinessesResponseSchema = z.object({
    businesses: z.array(BusinessSchema)
})

const AlertSchema = z.object({
    id: z.string(),
    businessId: z.string(),
    type: z.string(),
    message: z.string(),
    severity: z.enum(['info', 'warning', 'critical']),
    isRead: z.boolean().default(false),
    createdAt: z.string(),
    updatedAt: z.string().optional()
})

const AlertsResponseSchema = z.object({
    alerts: z.array(AlertSchema)
})

// ============== API CLIENT ==============

export const apiClient = {
    // ---- TRANSACTIONS ----

    /**
     * Get transactions for a business within date range
     */
    async getTransactions(
        businessId: string,
        startDate?: string,
        endDate?: string
    ): Promise<Transaction[]> {
        const queryString = createQueryString({ businessId, startDate, endDate })

        const data = await apiCall<any>(
            `/api/transactions${queryString}`,
            { method: 'GET' }
        )

        return data.transactions as Transaction[]
    },

    /**
     * Create a new transaction from natural language input
     */
    async createTransaction(payload: {
        input: string
        businessId: string
        method?: 'manual' | 'voice'
    }): Promise<Transaction> {
        const response = await apiCall<any>(
            '/api/transactions',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }
        )

        if (!response.transaction) {
            throw new Error('Transação não foi criada')
        }

        return response.transaction as Transaction
    },

    /**
     * Update an existing transaction
     */
    async updateTransaction(
        id: string,
        payload: Partial<Omit<Transaction, 'id' | 'businessId'>>
    ): Promise<Transaction> {
        const response = await apiCall<any>(
            '/api/transactions',
            {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...payload })
            }
        )

        if (!response.transaction) {
            throw new Error('Transação não foi atualizada')
        }

        return response.transaction as Transaction
    },

    /**
     * Delete a transaction (soft delete)
     */
    async deleteTransaction(id: string): Promise<void> {
        await apiCall(
            '/api/transactions',
            {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            }
        )
    },

    /**
     * Restore a deleted transaction
     */
    async restoreTransaction(payload: {
        type: 'income' | 'expense'
        amount: number
        description: string
        category: string
        method?: string
        businessId: string
        date?: string
    }): Promise<Transaction> {
        const response = await apiCall<any>(
            '/api/transactions/restore',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }
        )

        if (!response.transaction) {
            throw new Error('Transação não foi restaurada')
        }

        return response.transaction as Transaction
    },

    // ---- CATEGORIES ----

    /**
     * Get all categories for a business
     */
    async getCategories(businessId: string): Promise<Category[]> {
        const queryString = createQueryString({ businessId })

        const data = await apiCall<any>(
            `/api/categories${queryString}`,
            { method: 'GET' }
        )

        return data.categories as Category[]
    },

    // ---- ACCOUNTS ----

    /**
     * Get all accounts for a business
     */
    async getAccounts(businessId: string): Promise<Account[]> {
        const queryString = createQueryString({ businessId })

        const data = await apiCall<any>(
            `/api/accounts${queryString}`,
            { method: 'GET' }
        )

        return data.accounts as Account[]
    },

    // ---- BUSINESSES ----

    /**
     * Get all businesses for the current user
     */
    async getBusinesses(): Promise<Business[]> {
        const data = await apiCall<any>(
            '/api/businesses',
            { method: 'GET' }
        )

        return data.businesses as Business[]
    },

    // ---- ALERTS ----

    /**
     * Get alerts for a business
     */
    async getAlerts(businessId: string): Promise<Alert[]> {
        const queryString = createQueryString({ businessId })

        const data = await apiCall<any>(
            `/api/alerts${queryString}`,
            { method: 'GET' }
        )

        return data.alerts as Alert[]
    },

    /**
     * Generate new alerts for a business
     */
    async generateAlerts(businessId: string): Promise<Alert[]> {
        const data = await apiCall<any>(
            '/api/alerts',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessId })
            }
        )

        return data.alerts as Alert[]
    }
}

/**
 * Type-safe wrapper para usar apiClient em componentes
 * Automaticamente inclui tratamento de erro e loading states
 */
export type ApiClient = typeof apiClient
