/**
 * API Integration Tests
 * Validates core endpoints functionality
 */

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface TestResult {
    name: string
    status: 'PASS' | 'FAIL'
    error?: string
    data?: any
    duration: number
}

const results: TestResult[] = []

async function runTest(
    name: string,
    testFn: () => Promise<any>
): Promise<void> {
    const startTime = Date.now()
    try {
        const data = await testFn()
        results.push({
            name,
            status: 'PASS',
            data,
            duration: Date.now() - startTime,
        })
        console.log(`✅ ${name} (${Date.now() - startTime}ms)`)
    } catch (error: any) {
        results.push({
            name,
            status: 'FAIL',
            error: error.message || String(error),
            duration: Date.now() - startTime,
        })
        console.log(`❌ ${name}: ${error.message || String(error)}`)
    }
}

async function testApiEndpoints() {
    console.log('\n🧪 Testing API Endpoints...\n')

    // Test 1: Check if user is authenticated
    await runTest('User Authentication', async () => {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw new Error(`Auth error: ${error.message}`)
        if (!data.session) {
            throw new Error(
                'No active session. Please log in first via UI at http://localhost:3003'
            )
        }
        return { userId: data.session.user.id }
    })

    // Test 2: Get businesses
    await runTest('Fetch Businesses', async () => {
        const response = await fetch(
            'http://localhost:3003/api/businesses',
            {
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: document.cookie,
                },
            }
        )

        if (!response.ok) {
            throw new Error(
                `API error: ${response.status} ${response.statusText}`
            )
        }

        const data = await response.json()
        if (!data.businesses || data.businesses.length === 0) {
            throw new Error('No businesses found. Please create one first.')
        }
        return data
    })

    // Test 3: Create account
    let businessId: string = ''
    await runTest('Get Business ID for Tests', async () => {
        const response = await fetch(
            'http://localhost:3003/api/businesses',
            {
                headers: { 'Content-Type': 'application/json' },
            }
        )
        const data = await response.json()
        if (!data.businesses || data.businesses.length === 0) {
            throw new Error('No businesses found')
        }
        businessId = data.businesses[0].id
        return { businessId }
    })

    if (businessId) {
        await runTest('Create Account', async () => {
            const accountData = {
                name: `Test Account ${Date.now()}`,
                type: 'bank',
                balance: 1000.5,
                businessId,
            }

            const response = await fetch(
                'http://localhost:3003/api/accounts',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(accountData),
                }
            )

            if (!response.ok) {
                const error = await response.json()
                throw new Error(
                    `Failed to create account: ${JSON.stringify(error)}`
                )
            }

            return await response.json()
        })

        await runTest('Fetch Accounts', async () => {
            const response = await fetch(
                `http://localhost:3003/api/accounts?businessId=${businessId}`,
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            )

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`)
            }

            const data = await response.json()
            if (!data.accounts) {
                throw new Error('Invalid response structure')
            }
            return { count: data.accounts.length }
        })

        await runTest('Create Category', async () => {
            const categoryData = {
                name: `Test Category ${Date.now()}`,
                type: 'expense',
                color: '#FF6B6B',
                businessId,
            }

            const response = await fetch(
                'http://localhost:3003/api/categories',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(categoryData),
                }
            )

            if (!response.ok) {
                const error = await response.json()
                throw new Error(
                    `Failed to create category: ${JSON.stringify(error)}`
                )
            }

            return await response.json()
        })

        await runTest('Fetch Categories', async () => {
            const response = await fetch(
                `http://localhost:3003/api/categories?businessId=${businessId}`,
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            )

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`)
            }

            const data = await response.json()
            if (!data.categories) {
                throw new Error('Invalid response structure')
            }
            return { count: data.categories.length }
        })
    }

    // Summary
    console.log('\n📊 Test Summary\n')
    const passed = results.filter((r) => r.status === 'PASS').length
    const failed = results.filter((r) => r.status === 'FAIL').length
    const total = results.length
    const avgDuration = (
        results.reduce((sum, r) => sum + r.duration, 0) / total
    ).toFixed(0)

    console.log(`Total Tests: ${total}`)
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`⏱️  Average Time: ${avgDuration}ms\n`)

    if (failed > 0) {
        console.log('Failed Tests:')
        results
            .filter((r) => r.status === 'FAIL')
            .forEach((r) => {
                console.log(`  - ${r.name}: ${r.error}`)
            })
    }

    return { passed, failed, total }
}

// Run tests
testApiEndpoints().catch((error) => {
    console.error('Test suite error:', error)
    process.exit(1)
})
