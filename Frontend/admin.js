document.addEventListener('DOMContentLoaded', async () => {
    // API CONFIG
    const PROD_API_URL = 'https://datasprint-backend.vercel.app/api';
    const DEV_API_URL = 'http://localhost:5000/api';

    const isLocal = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.startsWith('192.168.') ||
        window.location.hostname.startsWith('10.') ||
        window.location.hostname.endsWith('.local');

    const API_BASE_URL = isLocal ? DEV_API_URL : PROD_API_URL;

    // Notification System
    const showNotification = (message, type = 'info') => {
        const container = document.getElementById('notification-container');
        if (!container) return;
        const notif = document.createElement('div');
        notif.className = `notification ${type}`;
        notif.innerHTML = `<span>${message}</span>`;
        container.appendChild(notif);
        setTimeout(() => {
            notif.classList.add('fade-out');
            setTimeout(() => notif.remove(), 500);
        }, 3000);
    };

    const checkAdminAccess = async () => {
        const token = localStorage.getItem('ds_token');
        if (!token) {
            window.location.href = 'index.html';
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/users/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            // Robust Admin Check
            const isAdmin = data.user.role === 'admin' ||
                data.user.role === 'ADMIN' ||
                data.user.username.toLowerCase().includes('admin');

            if (!res.ok || !isAdmin) {
                console.warn('Admin Access Denied:', data.user);
                alert('ACCESS DENIED: Administrative Privileges Required');
                window.location.href = 'index.html';
            }
        } catch (error) {
            window.location.href = 'index.html';
        }
    };

    const fetchTeams = async () => {
        const token = localStorage.getItem('ds_token');
        const tbody = document.getElementById('teams-body');

        try {
            const res = await fetch(`${API_BASE_URL}/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok) {
                tbody.innerHTML = '';
                if (data.users.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="9" style="text-align: center; padding: 50px;">
                                <div class="font-mono" style="color: var(--p-400); font-size: 1.2rem;">NO_DATA_STREAMS_DETECTED</div>
                                <p class="text-muted" style="margin-top: 10px;">Waiting for new nodes to join the grid...</p>
                            </td>
                        </tr>`;
                    return;
                }

                data.users.forEach(user => {
                    const row = document.createElement('tr');
                    const membersCount = [user.m1Name, user.m2Name, user.m3Name].filter(m => m && m !== '---').length;

                    row.innerHTML = `
                        <td class="font-mono text-p-400">${user.teamName}</td>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${user.phone}</td>
                        <td>${membersCount + 1}</td>
                        <td>${user.college}</td>
                        <td><span class="badge ${user.isVerified ? 'badge-verified' : 'badge-pending'}">${user.isVerified ? 'VERIFIED' : 'PENDING'}</span></td>
                        <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                            <button class="btn-view" data-id="${user.id}">VIEW</button>
                        </td>
                    `;
                    tbody.appendChild(row);

                    // Add click listener for View button
                    row.querySelector('.btn-view').addEventListener('click', () => showTeamDetails(user));
                });
            } else {
                tbody.innerHTML = `<tr><td colspan="9" class="text-error">Error fetching data: ${data.message}</td></tr>`;
            }
        } catch (error) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-error">Network error. Check connection.</td></tr>';
        }
    };

    const modal = document.getElementById('details-modal');
    const closeBtn = document.getElementById('close-modal-btn');
    const grid = document.getElementById('modal-details-grid');
    const modalTeamName = document.getElementById('modal-team-name');

    const showTeamDetails = (user) => {
        modalTeamName.innerText = user.teamName;
        grid.innerHTML = `
            <div class="detail-section">
                <h4>TEAM_LEAD</h4>
                <div class="detail-item"><span class="detail-label">Name</span><div class="detail-value">${user.name}</div></div>
                <div class="detail-item"><span class="detail-label">Email</span><div class="detail-value">${user.email}</div></div>
                <div class="detail-item"><span class="detail-label">Phone</span><div class="detail-value">${user.phone}</div></div>
                <div class="detail-item"><span class="detail-label">College</span><div class="detail-value">${user.college}</div></div>
                <div class="detail-item"><span class="detail-label">Dept / Year</span><div class="detail-value">${user.dept} / ${user.year} Year</div></div>
            </div>
            
            <div class="detail-section">
                <h4>MEMBER_1</h4>
                ${user.m1Name ? `
                    <div class="detail-item"><span class="detail-label">Name</span><div class="detail-value">${user.m1Name}</div></div>
                    <div class="detail-item"><span class="detail-label">Email</span><div class="detail-value">${user.m1Email || '---'}</div></div>
                    <div class="detail-item"><span class="detail-label">Phone</span><div class="detail-value">${user.m1Phone || '---'}</div></div>
                    <div class="detail-item"><span class="detail-label">Dept / Year</span><div class="detail-value">${user.m1Dept || '---'} / ${user.m1Year || '---'}</div></div>
                ` : '<div class="text-muted">Not Registered</div>'}
            </div>

            <div class="detail-section">
                <h4>MEMBER_2</h4>
                ${user.m2Name ? `
                    <div class="detail-item"><span class="detail-label">Name</span><div class="detail-value">${user.m2Name}</div></div>
                    <div class="detail-item"><span class="detail-label">Email</span><div class="detail-value">${user.m2Email || '---'}</div></div>
                    <div class="detail-item"><span class="detail-label">Phone</span><div class="detail-value">${user.m2Phone || '---'}</div></div>
                    <div class="detail-item"><span class="detail-label">Dept / Year</span><div class="detail-value">${user.m2Dept || '---'} / ${user.m2Year || '---'}</div></div>
                ` : '<div class="text-muted">Not Registered</div>'}
            </div>

            <div class="detail-section">
                <h4>MEMBER_3</h4>
                ${user.m3Name ? `
                    <div class="detail-item"><span class="detail-label">Name</span><div class="detail-value">${user.m3Name}</div></div>
                    <div class="detail-item"><span class="detail-label">Email</span><div class="detail-value">${user.m3Email || '---'}</div></div>
                    <div class="detail-item"><span class="detail-label">Phone</span><div class="detail-value">${user.m3Phone || '---'}</div></div>
                    <div class="detail-item"><span class="detail-label">Dept / Year</span><div class="detail-value">${user.m3Dept || '---'} / ${user.m3Year || '---'}</div></div>
                ` : '<div class="text-muted">Not Registered</div>'}
            </div>
        `;
        modal.classList.add('active');
    };

    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    // --- Mobile Menu Logic ---
    const mobileToggle = document.getElementById('admin-mobile-toggle');
    const navLinks = document.getElementById('admin-nav-links');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu on resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navLinks && mobileToggle) {
            navLinks.classList.remove('active');
            mobileToggle.classList.remove('active');
        }
    });

    const setupExport = () => {
        const downloadBtn = document.getElementById('download-csv');
        downloadBtn.addEventListener('click', async () => {
            const token = localStorage.getItem('ds_token');
            try {
                const res = await fetch(`${API_BASE_URL}/users/export`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `datasprint_registrations_${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                } else {
                    alert('Export failed');
                }
            } catch (error) {
                alert('Network error during export');
            }
        });
    };

    await checkAdminAccess();
    await fetchTeams();
    setupExport();

    // Logout Logic
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Use script.js helpers if available, or manual clear
            localStorage.removeItem('ds_token');
            localStorage.removeItem('ds_user');

            // Visual feedback
            logoutBtn.innerHTML = 'LOGGING OUT...';
            logoutBtn.style.opacity = '0.7';

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 800);
        });
    }
});
