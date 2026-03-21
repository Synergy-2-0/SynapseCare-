// MediLink Frontend Core Logic
// Handling interactions with the backend Microservices Gateway/Endpoints

const API_BASE_URL = 'http://localhost:8080'; // Gateway or main entry point

document.addEventListener('DOMContentLoaded', () => {
    
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    if(navbar) {
        window.addEventListener('scroll', () => {
             if (window.scrollY > 50) {
                 navbar.classList.add('scrolled');
             } else {
                 navbar.classList.remove('scrolled');
             }
        });
    }

    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // In a real application, this would call the API Gateway / Auth Service
            // For demo purposes, we will mock the login based on role detection
            
            try {
                // Simulate API Call
                console.log('Logging in:', email);
                
                // MOCK LOGIC: Determine role based on email for testing
                let role = 'patient';
                let name = 'John Doe';
                
                if (email.includes('dr.') || email.includes('doctor')) {
                    role = 'doctor';
                    name = 'Dr. ' + email.split('@')[0].replace('dr.', '');
                }

                // Store session
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userRole', role);
                localStorage.setItem('userName', name);
                
                // Redirect
                window.location.href = 'dashboard.html';
                
            } catch (error) {
                console.error("Login failed:", error);
                alert('Invalid credentials!');
            }
        });
    }

    // Register Form Handler
    const registerForm = document.getElementById('registerForm');
    if(registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const role = document.getElementById('reg-role').value;
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const phone = document.getElementById('reg-phone').value;
            
            let payload = {
                name,
                email,
                phone,
                password
            }

            // Build payload based on role
            if (role === 'patient') {
                payload.dob = document.getElementById('reg-dob').value;
                payload.gender = document.getElementById('reg-gender').value;
                payload.address = document.getElementById('reg-address').value;
            } else {
                payload.specialization = document.getElementById('reg-spec').value;
                payload.experience = parseInt(document.getElementById('reg-exp').value);
            }

            console.log(`Registering as ${role}`, payload);

            // MOCK API REQUEST: Route to appropriate service
            const endpoint = role === 'patient' 
                ? `${API_BASE_URL}/api/patients` 
                : `${API_BASE_URL}/api/doctors`;

            try {
                // For demonstration: simulate a successful response without actually calling backend since it might not be running or lack CORS
                /*
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                if (!response.ok) throw new Error('Registration failed');
                */
                
                alert('Registration successful! Please login.');
                window.location.href = 'login.html';
                
            } catch (error) {
                console.error("Registration error:", error);
                alert('Failed to register. See console.');
            }
        });
    }

    // Logout Handler
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
});
