import { parseTransaction } from '../lib/nlp/transaction-parser'

console.log('🧪 Testing NLP Transaction Parser\n')

const testCases = [
    'Corte cabelo 35',
    'Barba 25',
    'Luz 180',
    'Produto limpeza 42',
    'Recebi 50 de João',
    'Paguei aluguel 1200',
    'Venda de produto 80',
    'Comprei tesoura 150',
    'Coloração 120',
    'Manicure 40',
]

testCases.forEach((input, index) => {
    console.log(`\n${index + 1}. Input: "${input}"`)
    const result = parseTransaction(input)

    if (result) {
        console.log(`   ✅ Type: ${result.type}`)
        console.log(`   💰 Amount: R$ ${result.amount.toFixed(2)}`)
        console.log(`   📁 Category: ${result.category}`)
        console.log(`   📊 Confidence: ${(result.confidence * 100).toFixed(0)}%`)
    } else {
        console.log(`   ❌ Failed to parse`)
    }
})

console.log('\n✅ Parser test complete!')
