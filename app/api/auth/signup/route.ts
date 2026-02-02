import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const signupSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    businessName: z.string().min(1),
    businessType: z.enum(['barbershop', 'salon', 'workshop', 'retail', 'other']),
})

// Default categories for each business type
const DEFAULT_CATEGORIES = {
    barbershop: {
        income: ['Corte de Cabelo', 'Barba', 'Coloração', 'Produtos'],
        expense: ['Aluguel', 'Energia Elétrica', 'Água', 'Produtos', 'Limpeza'],
    },
    salon: {
        income: ['Corte', 'Coloração', 'Manicure', 'Pedicure', 'Escova', 'Hidratação', 'Produtos'],
        expense: ['Aluguel', 'Energia Elétrica', 'Água', 'Produtos', 'Limpeza'],
    },
    workshop: {
        income: ['Serviços', 'Peças', 'Mão de Obra'],
        expense: ['Aluguel', 'Energia Elétrica', 'Ferramentas', 'Peças', 'Limpeza'],
    },
    retail: {
        income: ['Vendas', 'Serviços'],
        expense: ['Aluguel', 'Energia Elétrica', 'Água', 'Estoque', 'Limpeza'],
    },
    other: {
        income: ['Serviços', 'Produtos'],
        expense: ['Aluguel', 'Energia Elétrica', 'Água', 'Despesas Gerais'],
    },
}

export async function POST(req: NextRequest) {
    try {
        console.log('Signup request received')
        const body = await req.json()
        console.log('Signup body:', { ...body, password: '****' })

        const { name, email, password, businessName, businessType } = signupSchema.parse(body)
        console.log('Signup data parsed successfully')

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            console.log('User already exists:', email)
            return NextResponse.json(
                { error: 'Este email já está cadastrado' },
                { status: 400 }
            )
        }

        // Hash password
        console.log('Hashing password...')
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user and business in a transaction
        console.log('Creating user and business in transaction...')
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                businesses: {
                    create: {
                        name: businessName,
                        type: businessType,
                        categories: {
                            create: [
                                // Income categories
                                ...DEFAULT_CATEGORIES[businessType as keyof typeof DEFAULT_CATEGORIES].income.map((cat) => ({
                                    name: cat,
                                    type: 'income',
                                    isDefault: true,
                                })),
                                // Expense categories
                                ...DEFAULT_CATEGORIES[businessType as keyof typeof DEFAULT_CATEGORIES].expense.map((cat) => ({
                                    name: cat,
                                    type: 'expense',
                                    isDefault: true,
                                })),
                            ],
                        },
                    },
                },
            },
            include: {
                businesses: true,
            },
        })

        console.log('User created successfully:', user.id)

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            business: user.businesses[0],
        })
    } catch (error: any) {
        console.error('Signup error details:', {
            message: error.message,
            stack: error.stack,
            error
        })

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Dados inválidos' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: error.message || 'Erro ao criar conta' },
            { status: 500 }
        )
    }
}
