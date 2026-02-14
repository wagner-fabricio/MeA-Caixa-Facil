/**
 * Type Definitions for MeA Caixa Fácil
 * Central location for all TypeScript interfaces
 */

// ============== USER & AUTH ==============

export interface User {
    id: string
    email: string
    created_at: string
    user_metadata?: {
        name?: string
        avatar_url?: string
    }
    app_metadata?: {
        provider?: string
    }
}

// ============== BUSINESS ==============

export type BusinessType = 'barbershop' | 'salon' | 'workshop' | 'retail' | 'other'

export interface Business {
    id: string
    ownerId: string
    name: string
    type: BusinessType
    createdAt: string
    updatedAt: string
}

// ============== TRANSACTIONS ==============

export type TransactionType = 'income' | 'expense'
export type TransactionMethod = 'manual' | 'voice'

export interface Transaction {
    id: string
    businessId: string
    type: TransactionType
    amount: number
    description: string
    category: string
    method: TransactionMethod
    date: string
    createdAt: string
    updatedAt?: string
    deletedAt?: string | null
}

export interface ParsedTransaction {
    type: TransactionType
    amount: number
    category: string
    description: string
    confidence: number
}

// ============== CATEGORIES ==============

export interface Category {
    id: string
    businessId: string
    name: string
    type: TransactionType
    color?: string
    usageCount: number
    isDefault: boolean
    createdAt: string
    updatedAt?: string
}

// ============== ACCOUNTS ==============

export type AccountType = 'bank' | 'card' | 'wallet' | 'cash'

export interface Account {
    id: string
    businessId: string
    name: string
    type: AccountType
    balance: number
    createdAt: string
    updatedAt?: string
}

// ============== ALERTS ==============

export type AlertType = 'no_activity' | 'spending_spike' | 'negative_balance' | 'monthly_comparison'
export type AlertSeverity = 'info' | 'warning' | 'critical'

export interface Alert {
    id: string
    businessId: string
    type: AlertType
    message: string
    severity: AlertSeverity
    isRead: boolean
    createdAt: string
    updatedAt?: string
}

// ============== DASHBOARD ==============

export interface DashboardData {
    balance: number
    todayIncome: number
    todayExpense: number
    transactions: Transaction[]
    allTransactions: Transaction[]
}

// ============== API RESPONSES ==============

export interface ApiResponse<T> {
    data?: T
    error?: string
    success?: boolean
}

export interface PaginatedResponse<T> {
    items: T[]
    total: number
    page: number
    perPage: number
    totalPages: number
}

export interface TransactionsResponse {
    transactions: Transaction[]
    pagination?: {
        total: number
        page: number
        perPage: number
        totalPages: number
    }
}

export interface CategoriesResponse {
    categories: Category[]
}

export interface AccountsResponse {
    accounts: Account[]
}

export interface BusinessesResponse {
    businesses: Business[]
}

export interface AlertsResponse {
    alerts: Alert[]
}

// ============== FORM TYPES ==============

export interface ExpenseFormData {
    valor: string
    data: string
    tipo: TransactionType
    categoria: string
    conta: string
    descricao: string
}

export interface EditedTransaction {
    id?: string
    amount: string | number
    description: string
    category: string
    type: TransactionType
}

// ============== PERIOD FILTER ==============

export type PeriodFilterType = 'today' | 'week' | 'month' | 'year' | 'custom'

export interface PeriodFilter {
    type: PeriodFilterType
    startDate?: string
    endDate?: string
}

// ============== COMPONENT PROPS ==============

export interface DashboardHeaderProps {
    userName?: string
    businessName?: string
}

export interface ExpenseModalProps {
    isOpen: boolean
    onClose: () => void
    businessId: string
    onSuccess?: () => void
}

export interface ConfirmDialogProps {
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void | Promise<void>
    onCancel?: () => void
    confirmText?: string
    cancelText?: string
    isDangerous?: boolean
}

export interface PeriodFilterProps {
    onFilterChange: (filter: PeriodFilter) => void
    currentFilter: PeriodFilter
}

export interface TransactionInputProps {
    businessId: string
    onSuccess?: () => void
}

export interface SidebarNavProps {
    onNavigate?: () => void
}

// ============== ERROR TYPES ==============

export interface AppError extends Error {
    code?: string
    statusCode?: number
    context?: Record<string, any>
}

// ============== UTILITY TYPES ==============

export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type Async<T> = Promise<T>
