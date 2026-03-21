document.addEventListener('DOMContentLoaded', () => {
    const docId = localStorage.getItem('user_id');
    const docName = localStorage.getItem('user_name');
    
    if(!docId) { console.warn("No doc ID"); }
    else {
        document.getElementById('nav-name').innerText = `Dr. ${docName}`;
        document.getElementById('nav-initials').innerText = docName.charAt(0).toUpperCase();
        loadDoctorStats();
    }
});

async function loadDoctorStats() {
    const docId = localStorage.getItem('user_id');
    try {
        const appts = await apiCall(`${CONFIG.API_GATEWAY_APPOINTMENT}/appointments/doctor/${docId}`);
        document.getElementById('stat-patients').innerText = appts.length;
        
        const tbody = document.getElementById('doctor-appts');
        tbody.innerHTML = '';
        
        appts.forEach(a => {
            if(a.status === 'CONFIRMED') {
                tbody.innerHTML += `
                    <tr>
                        <td>Patient #${a.patientId}</td>
                        <td>${new Date(a.appointmentDate).toLocaleTimeString()}</td>
                        <td><span class="status-badge status-confirmed">Active</span></td>
                        <td>
                            <button class="btn btn-outline" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="startCall(${a.id}, ${a.patientId})"><i class="fa-solid fa-video"></i> Init Consult</button>
                        </td>
                    </tr>
                `;
            }
        });
    } catch (err) { }
}

function startCall(apptId, patientId) {
    document.getElementById('rx-appt-id').value = apptId;
    document.getElementById('rx-patient-id').value = patientId;
    showTab('tab-consultations');
}

async function submitPrescription(e) {
    e.preventDefault();
    const payload = {
        appointmentId: document.getElementById('rx-appt-id').value,
        patientId: document.getElementById('rx-patient-id').value,
        doctorId: localStorage.getItem('user_id'),
        medicines: document.getElementById('rx-medicines').value,
        notes: document.getElementById('rx-notes').value,
        issueDate: new Date().toISOString()
    };
    
    try {
        await apiCall(`${CONFIG.API_GATEWAY_PATIENT}/prescriptions`, 'POST', payload);
        alert("Prescription officially saved to Patient History.");
        document.getElementById('rx-form').reset();
    } catch(err) { alert("Failed to save prescription."); }
}

async function addSlot(e) {
    e.preventDefault();
    const date = document.getElementById('slot-date').value;
    const time = document.getElementById('slot-time').value;
    const payload = {
        doctorId: localStorage.getItem('user_id'),
        slotTime: `${date}T${time}:00`,
        isAvailable: true
    };
    
    try {
        await apiCall(`${CONFIG.API_GATEWAY_DOCTOR}/doctors/${payload.doctorId}/availability`, 'POST', payload);
        alert("Slot successfully opened for patients!");
        loadSlots(); // Refresh UI
    } catch(err) { alert("Failed to add slot to Database."); }
}

async function loadSlots() {
    const docId = localStorage.getItem('user_id');
    try {
        const slots = await apiCall(`${CONFIG.API_GATEWAY_DOCTOR}/doctors/${docId}/availability`);
        document.getElementById('slot-list').innerHTML = slots.map(s => `
            <div style="padding:10px; border:1px solid #ccc; margin-bottom:5px; border-radius:5px;">
                ${new Date(s.slotTime).toLocaleString()} - ${s.isAvailable ? 'Available' : 'Booked'}
            </div>
        `).join('');
    } catch (err) { }
}
