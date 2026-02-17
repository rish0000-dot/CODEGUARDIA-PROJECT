const axios = require('axios');

async function testRBAC() {
    const users = [
        { email: 'admin@codeguardian.ai', password: 'password123', expectedRole: 'ADMIN' },
        { email: 'dev@codeguardian.ai', password: 'password123', expectedRole: 'DEVELOPER' },
        { email: 'viewer@codeguardian.ai', password: 'password123', expectedRole: 'VIEWER' }
    ];

    for (const u of users) {
        console.log(`\n--- Testing Role: ${u.expectedRole} (${u.email}) ---`);
        try {
            const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
                email: u.email,
                password: u.password
            });
            const token = loginRes.data.token;
            console.log('Login: SUCCESS');

            // Test Audit Logs (Admin only)
            try {
                const logsRes = await axios.get('http://localhost:5000/api/admin/audit-logs', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('Access Audit Logs:', u.expectedRole === 'ADMIN' ? 'SUCCESS (Correct)' : 'SUCCESS (BUG: Should be blocked)');
            } catch (err) {
                console.log('Access Audit Logs:', err.response?.status === 403 ? 'BLOCKED (Correct)' : `FAILED with status ${err.response?.status}`);
            }

            // Test User List (Admin/Developer)
            try {
                const usersRes = await axios.get('http://localhost:5000/api/admin/users', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('Access User List:', ['ADMIN', 'DEVELOPER'].includes(u.expectedRole) ? 'SUCCESS (Correct)' : 'SUCCESS (BUG: Should be blocked)');
            } catch (err) {
                console.log('Access User List:', err.response?.status === 403 ? 'BLOCKED (Correct)' : `FAILED with status ${err.response?.status}`);
            }

        } catch (err) {
            console.error('Login Failed for', u.email, err.message);
        }
    }
}

testRBAC();
