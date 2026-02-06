const API_URL = 'http://localhost:5000/api';

async function loginTest() {
    console.log('🚀 Verifying Admin Login...');
    try {
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: "test_verifier@datasprint", password: "Password123" })
        });
        const loginData = await loginRes.json();

        if (loginRes.ok) {
            console.log('✅ Login Successful.');
            console.log('Role:', loginData.user.role);
            if (loginData.user.role === 'admin') {
                console.log('🎉 ADMIN ACCESS CONFIRMED.');
            } else {
                console.error('❌ User is not admin.');
            }
        } else {
            console.error('❌ Login Failed:', loginData);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

loginTest();
