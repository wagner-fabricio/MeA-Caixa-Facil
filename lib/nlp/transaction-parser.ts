/**
 * NLP Transaction Parser
 * Parses natural language input into structured transaction data
 * Uses regex patterns to extract amount, type, and category
 */

export interface ParsedTransaction {
    type: 'income' | 'expense'
    amount: number
    category: string
    description: string
    confidence: number // 0-1 score
}

// Income keywords (Brazilian Portuguese)
const INCOME_KEYWORDS = [
    'recebi',
    'recebido',
    'venda',
    'vendido',
    'corte',
    'barba',
    'coloração',
    'coloracao',
    'manicure',
    'pedicure',
    'escova',
    'hidratação',
    'hidratacao',
    'massagem',
    'depilação',
    'depilacao',
    'cliente',
    'pagamento',
    'entrada',
    'ganho',
]

// Expense keywords
const EXPENSE_KEYWORDS = [
    'paguei',
    'pago',
    'comprei',
    'comprado',
    'gastei',
    'gasto',
    'luz',
    'água',
    'agua',
    'aluguel',
    'internet',
    'telefone',
    'produto',
    'produtos',
    'limpeza',
    'manutenção',
    'manutencao',
    'fornecedor',
    'conta',
    'despesa',
    'saída',
    'saida',
]

// Category mapping
const CATEGORY_MAP: Record<string, string> = {
    // Income categories
    corte: 'Corte de Cabelo',
    barba: 'Barba',
    'coloração': 'Coloração',
    coloracao: 'Coloração',
    manicure: 'Manicure',
    pedicure: 'Pedicure',
    escova: 'Escova',
    'hidratação': 'Hidratação',
    hidratacao: 'Hidratação',
    massagem: 'Massagem',
    'depilação': 'Depilação',
    depilacao: 'Depilação',

    // Expense categories
    luz: 'Energia Elétrica',
    água: 'Água',
    agua: 'Água',
    aluguel: 'Aluguel',
    internet: 'Internet',
    telefone: 'Telefone',
    produto: 'Produtos',
    produtos: 'Produtos',
    limpeza: 'Limpeza',
    'manutenção': 'Manutenção',
    manutencao: 'Manutenção',
}

/**
 * Extract monetary value from text
 * Handles: "35", "R$ 35", "35 reais", "trinta e cinco"
 */
function extractAmount(text: string): number | null {
    // Remove common currency symbols and normalize
    const normalized = text
        .toLowerCase()
        .replace(/r\$\s*/g, '')
        .replace(/reais?/g, '')
        .trim()

    // Try to find a number (integer or decimal)
    const numberMatch = normalized.match(/\d+([.,]\d{1,2})?/)
    if (numberMatch) {
        const value = numberMatch[0].replace(',', '.')
        return parseFloat(value)
    }

    // Handle written numbers (basic)
    const writtenNumbers: Record<string, number> = {
        'um': 1, 'uma': 1,
        'dois': 2, 'duas': 2,
        'três': 3, 'tres': 3,
        'quatro': 4,
        'cinco': 5,
        'seis': 6,
        'sete': 7,
        'oito': 8,
        'nove': 9,
        'dez': 10,
        'vinte': 20,
        'trinta': 30,
        'quarenta': 40,
        'cinquenta': 50,
        'cem': 100,
        'cento': 100,
    }

    for (const [word, value] of Object.entries(writtenNumbers)) {
        if (normalized.includes(word)) {
            return value
        }
    }

    return null
}

/**
 * Detect transaction type (income or expense)
 */
function detectType(text: string): 'income' | 'expense' | null {
    const lowerText = text.toLowerCase()

    const hasIncomeKeyword = INCOME_KEYWORDS.some(keyword =>
        lowerText.includes(keyword)
    )
    const hasExpenseKeyword = EXPENSE_KEYWORDS.some(keyword =>
        lowerText.includes(keyword)
    )

    if (hasIncomeKeyword && !hasExpenseKeyword) return 'income'
    if (hasExpenseKeyword && !hasIncomeKeyword) return 'expense'

    // Default heuristic: if no clear keyword, assume income for barbershop context
    return null
}

/**
 * Suggest category based on keywords
 */
function suggestCategory(text: string, type: 'income' | 'expense'): string {
    const lowerText = text.toLowerCase()

    // Try to find a matching category keyword
    for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
        if (lowerText.includes(keyword)) {
            return category
        }
    }

    // Default categories
    return type === 'income' ? 'Serviços' : 'Despesas Gerais'
}

/**
 * Main parser function
 * Examples:
 * - "Corte cabelo 35" → { type: 'income', amount: 35, category: 'Corte de Cabelo' }
 * - "Luz 180" → { type: 'expense', amount: 180, category: 'Energia Elétrica' }
 * - "Recebi 50 de João" → { type: 'income', amount: 50, category: 'Serviços' }
 */
export function parseTransaction(input: string): ParsedTransaction | null {
    if (!input || input.trim().length === 0) {
        return null
    }

    const amount = extractAmount(input)
    if (!amount) {
        return null // Cannot parse without amount
    }

    const type = detectType(input) || 'income' // Default to income for barbershop
    const category = suggestCategory(input, type)

    // Calculate confidence score
    let confidence = 0.5 // Base confidence
    if (detectType(input)) confidence += 0.3 // Type detected
    if (category !== 'Serviços' && category !== 'Despesas Gerais') {
        confidence += 0.2 // Specific category found
    }

    return {
        type,
        amount,
        category,
        description: input.trim(),
        confidence: Math.min(confidence, 1.0),
    }
}

/**
 * Validate parsed transaction
 */
export function validateTransaction(parsed: ParsedTransaction | null): boolean {
    if (!parsed) return false
    if (parsed.amount <= 0) return false
    if (!parsed.type || !parsed.category) return false
    return true
}
