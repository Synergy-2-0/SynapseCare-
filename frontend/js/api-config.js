const CONFIG = {
    API_GATEWAY_PATIENT: 'http://localhost:8081/api',
    API_GATEWAY_DOCTOR: 'http://localhost:8082/api',
    API_GATEWAY_APPOINTMENT: 'http://localhost:8083/api',
    API_GATEWAY_INTEGRATION: 'http://localhost:8084/api',
    API_GATEWAY_ADMIN: 'http://localhost:8085/api'
};

// Generic Fetch Wrapper for Auth
async function apiCall(url, method = 'GET', body = null) {
    const token = localStorage.getItem('auth_token'); // If JWT is configured later
    const userId = localStorage.getItem('user_id'); // Temporary basic auth mechanism
    
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (userId) headers['X-User-Id'] = userId; // Fallback pattern

    const options = {
        method,
        headers
    };
    if (body) options.body = JSON.stringify(body);

    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        // If content-length is 0, return null
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    } catch (error) {
        console.error("API Call Failed:", error);
        throw error;
    }
}

function logoutUser() {
    localStorage.clear();
    window.location.href = 'login.html';
}

function showTab(id) {
    document.querySelectorAll('.dashboard-tab').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-links a').forEach(el => el.classList.remove('active'));
    document.getElementById(id).style.display = 'block';
    if(event) event.currentTarget.classList.add('active');
}

function showModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
