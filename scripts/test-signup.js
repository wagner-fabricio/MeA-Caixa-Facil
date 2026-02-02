async function testSignup() {
    try {
        console.log('Testing signup API...');
        const res = await fetch('http://localhost:3000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test' + Date.now() + '@example.com',
                password: 'password123',
                businessName: 'Test Biz',
                businessType: 'barbershop'
            })
        });

        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Response head (100 chars):', text.substring(0, 100));

        try {
            const json = JSON.parse(text);
            console.log('JSON parsed successfully:', json);
        } catch (e) {
            console.log('Failed to parse JSON:', e.message);
        }
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testSignup();
