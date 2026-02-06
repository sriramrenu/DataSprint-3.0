const API_URL = 'http://localhost:5000/api';
const EMAIL = 'test_verifier@gmail.com';
const OTP = '976452'; // From DB

async function runTest() {
    console.log('🚀 Starting FULL REGISTRATION Verification...');

    try {
        // 1. Verify OTP
        console.log('\n2️⃣  Verifying OTP...');
        const verifyRes = await fetch(`${API_URL}/auth/verify-registration-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL, otp: OTP })
        });
        const verifyData = await verifyRes.json();

        if (verifyRes.ok) {
            console.log('✅ OTP Verified.');
        } else {
            // It might fail if already verified, but we continue to try register
            console.log('⚠️ OTP Verification msg:', verifyData.message);
        }

        // 2. Register
        console.log('\n3️⃣  Registering Team...');
        const regPayload = {
            teamName: "TestTeamVerify",
            name: "Verifier",
            phone: "9988776655",
            email: EMAIL,
            college: "TestCollege",
            dept: "IT",
            year: "3",
            username: "test_verifier@datasprint",
            password: "Password123",
            // Required Member Fields
            m1Name: "Member1", m1Phone: "1112223333", m1Email: "m1@test.com", m1College: "Col1", m1Dept: "CSE", m1Year: "1",
            m2Name: "Member2", m2Phone: "1112223333", m2Email: "m2@test.com", m2College: "Col2", m2Dept: "CSE", m2Year: "2",
            m3Name: "Member3", m3Phone: "1112223333", m3Email: "m3@test.com", m3College: "Col3", m3Dept: "CSE", m3Year: "3"
        };

        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(regPayload)
        });
        const regData = await regRes.json();

        if (regRes.ok) {
            console.log('✅ Registration Successful.');
            console.log('User ID:', regData.user.id);
        } else {
            console.error('❌ Registration Failed:', regData);
            return;
        }

        // 3. Login
        console.log('\n4️⃣  Logging In...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: "test_verifier@datasprint", password: "Password123" })
        });
        const loginData = await loginRes.json();

        if (loginRes.ok) {
            console.log('✅ Login Successful.');
            console.log('Token:', loginData.token ? "RECEIVED" : "MISSING");
            console.log('Role:', loginData.user.role);
        } else {
            console.error('❌ Login Failed:', loginData);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

runTest();
