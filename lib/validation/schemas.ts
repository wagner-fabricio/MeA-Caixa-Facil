/**
 * Validation Schemas using Zod
 * Centralized validation rules for forms and API data
 */

import { z } from 'zod'

// ============== TRANSACTION ==============

export const TransactionSchema = z.object({
    type: z.enum(['income', 'expense']),
    amount: z
        .number()
        .positive('Valor deve ser maior que zero')
        .finite('Valor deve ser um número válido'),
    description: z.string().min(1, 'Descrição é obrigatória').max(500),
    category: z.string().min(1, 'Categoria é obrigatória'),
    date: z.string().datetime().optional()
})

export const CreateTransactionInputSchema = z.object({
    input: z
        .string()
        .min(1, 'Entrada não pode estar vazia')
        .max(500, 'Entrada muito longa'),
    businessId: z.string().min(1, 'ID de negócio obrigatório'),
    method: z.enum(['manual', 'voice']).optional()
})

export const UpdateTransactionSchema = z.object({
    id: z.string(),
    amount: z.number().positive().optional(),
    description: z.string().max(500).optional(),
    category: z.string().optional(),
    type: z.enum(['income', 'expense']).optional()
})

// ============== CATEGORY ==============

export const CategorySchema = z.object({
    name: z
        .string()
        .min(1, 'Nome obrigatório')
        .max(100, 'Nome muito longo'),
    type: z.enum(['income', 'expense']),
    color: z
        .string()
        .regex(/^#?([a-f0-9]{6}|[a-f0-9]{3})$/i, 'Cor inválida')
        .optional()
})

// ============== ACCOUNT ==============

export const AccountSchema = z.object({
    name: z
        .string()
        .min(1, 'Nome obrigatório')
        .max(100, 'Nome muito longo'),
    type: z.enum(['bank', 'card', 'wallet', 'cash']),
    balance: z.number().default(0)
})

// ============== BUSINESS ==============

export const BusinessSchema = z.object({
    name: z
        .string()
        .min(1, 'Nome obrigatório')
        .max(100, 'Nome muito longo'),
    type: z.enum(['barbershop', 'salon', 'workshop', 'retail', 'other'])
})

// ============== AUTH ==============

export const LoginSchema = z.object({
    email: z
        .string()
        .email('Email inválido'),
    password: z
        .string()
        .min(6, 'Senha deve ter no mínimo 6 caracteres')
})

export const SignupSchema = z.object({
    name: z
        .string()
        .min(1, 'Nome obrigatório')
        .max(100),
    email: z
        .string()
        .email('Email inválido'),
    password: z
        .string()
        .min(6, 'Senha deve ter no mínimo 6 caracteres')
        .regex(/[A-Z]/, 'Senha deve conter letra maiúscula')
        .regex(/[0-9]/, 'Senha deve conter número'),
    businessName: z
        .string()
        .min(1, 'Nome do negócio obrigatório')
        .max(100),
    businessType: z.enum(['barbershop', 'salon', 'workshop', 'retail', 'other'])
})

// ============== FORM DATA ==============

export const ExpenseFormSchema = z.object({
    valor: z
        .string()
        .min(1, 'Valor obrigatório')
        .refine((val) => !isNaN(parseFloat(val)), 'Valor deve ser um número'),
    data: z.string(),
    tipo: z.enum(['income', 'expense']),
    categoria: z.string().min(1, 'Categoria obrigatória'),
    conta: z.string().min(1, 'Conta obrigatória'),
    descricao: z.string().max(500)
})

// ============== PERIOD FILTER ==============

export const PeriodFilterSchema = z.object({
    type: z.enum(['today', 'week', 'month', 'year', 'custom']),
    startDate: z.string().optional(),
    endDate: z.string().optional()
})

// Type inference
export type Transaction = z.infer<typeof TransactionSchema>
export type Category = z.infer<typeof CategorySchema>
export type Account = z.infer<typeof AccountSchema>
export type Business = z.infer<typeof BusinessSchema>
export type Login = z.infer<typeof LoginSchema>
export type Signup = z.infer<typeof SignupSchema>
export type ExpenseForm = z.infer<typeof ExpenseFormSchema>
export type PeriodFilter = z.infer<typeof PeriodFilterSchema>
