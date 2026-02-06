const API_URL = 'http://localhost:5000/api';
const EMAIL = 'test_verifier@gmail.com';

async function runTest() {
    console.log('🚀 Starting Backend Logic Verification (Native Fetch)...');
    console.log(`📧 Testing with Email: ${EMAIL}`);

    try {
        // 1. Send OTP
        console.log('\n1️⃣  Sending OTP...');
        const response = await fetch(`${API_URL}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ OTP Request Sent Successfully.');
            console.log('Response:', data);
        } else {
            console.error('❌ Failed to send OTP:', data);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

runTest();
