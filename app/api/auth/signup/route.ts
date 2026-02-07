import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const signupSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6), // Still useful for form validation
    businessName: z.string().min(1),
    businessType: z.enum(['barbershop', 'salon', 'workshop', 'retail', 'other']),
    supabaseId: z.string().min(1), // Required now to link with Supabase Auth
})

// Default categories for each business type
const DEFAULT_CATEGORIES = {
    barbershop: {
        income: ['Corte de Cabelo', 'Barba', 'Combo', 'Produtos', 'Outros'],
        expense: ['Aluguel', 'Energia', 'Água', 'Produtos de Cabelo', 'Limpeza', 'Marketing'],
    },
    salon: {
        income: ['Cabelo', 'Unhas', 'Maquiagem', 'Estética', 'Produtos', 'Outros'],
        expense: ['Aluguel', 'Energia', 'Água', 'Produtos de Beleza', 'Limpeza', 'Comissões'],
    },
    workshop: {
        income: ['Serviços', 'Peças', 'Mão de Obra', 'Acessórios', 'Outros'],
        expense: ['Aluguel', 'Energia', 'Peças Reposição', 'Ferramentas', 'Limpeza'],
    },
    retail: {
        income: ['Vendas', 'Serviços', 'Outros'],
        expense: ['Fornecedores', 'Aluguel', 'Energia', 'Marketing', 'Logística'],
    },
    other: {
        income: ['Vendas', 'Serviços', 'Outros'],
        expense: ['Aluguel', 'Energia', 'Operacional', 'Marketing'],
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        console.log('Signup body:', { ...body, password: '****' })

        const { name, email, businessName, businessType, supabaseId } = signupSchema.parse(body)
        console.log('Signup data parsed successfully')

        // Check if user already exists by Supabase ID
        let user = await prisma.user.findUnique({
            where: { id: supabaseId },
            include: { businesses: true }
        })

        if (!user) {
            // Case 2: Check by email (important for linking existing records from migrations)
            const existingByEmail = await prisma.user.findUnique({
                where: { email },
            })

            if (existingByEmail) {
                console.log('Linking existing email to new Supabase ID:', email)
                // Update the existing user to use the new Supabase ID
                user = await prisma.user.update({
                    where: { email },
                    data: { id: supabaseId },
                    include: { businesses: true }
                })
            }
        }

        if (user && user.businesses.length > 0) {
            console.log('User and business already exist:', email)
            return NextResponse.json(
                { message: 'Usuário já configurado', user: { id: user.id, email: user.email } },
                { status: 200 }
            )
        }

        // If user exists but has no business, we continue to business creation
        // If user doesn't exist at all, we create both
        if (!user) {
            console.log('Creating new user and business...')
            user = await prisma.user.create({
                data: {
                    id: supabaseId,
                    name,
                    email,
                    businesses: {
                        create: {
                            name: businessName,
                            type: businessType,
                            categories: {
                                create: [
                                    ...DEFAULT_CATEGORIES[businessType as keyof typeof DEFAULT_CATEGORIES].income.map((cat) => ({
                                        name: cat,
                                        type: 'income',
                                        isDefault: true,
                                    })),
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
                include: { businesses: true }
            })
        } else if (user.businesses.length === 0) {
            console.log('User exists but no business, creating business for:', email)
            await prisma.business.create({
                data: {
                    ownerId: supabaseId,
                    name: businessName,
                    type: businessType,
                    categories: {
                        create: [
                            ...DEFAULT_CATEGORIES[businessType as keyof typeof DEFAULT_CATEGORIES].income.map((cat) => ({
                                name: cat,
                                type: 'income',
                                isDefault: true,
                            })),
                            ...DEFAULT_CATEGORIES[businessType as keyof typeof DEFAULT_CATEGORIES].expense.map((cat) => ({
                                name: cat,
                                type: 'expense',
                                isDefault: true,
                            })),
                        ],
                    },
                }
            })
        }

        console.log('User and Business created successfully:', user.id)

        return NextResponse.json({
            user: {
                id: (user as any).id,
                email: (user as any).email,
            }
        })
    } catch (error: any) {
        console.error('Signup error:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.format() }, { status: 400 })
        }
        return NextResponse.json(
            { error: error.message || 'Erro ao criar conta' },
            { status: 500 }
        )
    }
}
