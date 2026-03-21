document.addEventListener('DOMContentLoaded', () => {
    // Admin dashboard initial fetch
    loadSummary();
});

async function loadSummary() {
    try {
        // Mocking the aggregate endpoint or firing multiple fetches
        const pts = await apiCall(`${CONFIG.API_GATEWAY_PATIENT}/patients`);
        document.getElementById('admin-patient-count').innerText = pts ? pts.length : 0;
        
        const docs = await apiCall(`${CONFIG.API_GATEWAY_DOCTOR}/doctors`);
        const verified = docs ? docs.filter(d => d.isVerified).length : 0;
        document.getElementById('admin-doc-count').innerText = verified;
        
        const appts = await apiCall(`${CONFIG.API_GATEWAY_APPOINTMENT}/appointments`);
        document.getElementById('admin-appt-count').innerText = appts ? appts.length : 0;
    } catch(err) {} 
}

async function loadPendingDoctors() {
    try {
        const docs = await apiCall(`${CONFIG.API_GATEWAY_DOCTOR}/doctors`);
        if(!docs) return;
        
        const pend = docs.filter(d => !d.isVerified);
        const list = document.getElementById('admin-verify-list');
        list.innerHTML = pend.length === 0 ? "<tr><td colspan='4'>No pending doctors</td></tr>" : '';
        
        pend.forEach(d => {
            list.innerHTML += `
                <tr>
                    <td>#${d.id}</td>
                    <td>${d.name}</td>
                    <td>${d.specialty}</td>
                    <td>
                        <button class="btn btn-outline" style="border-color:#00b060; color:#00b060; padding:0.3rem 0.6rem;" onclick="verifyDoc(${d.id}, this)">Verify Authenticity</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {}
}

async function verifyDoc(id, btn) {
    try {
        await apiCall(`${CONFIG.API_GATEWAY_DOCTOR}/doctors/${id}/verify`, 'PUT');
        btn.innerText = "Verified";
        btn.disabled = true;
        btn.style.opacity = '0.5';
    } catch (err) {
        alert("Failed to verify. Admin permissions required or service error.");
    }
}
