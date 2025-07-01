// js/auth.js

// Ensure supabase client is available. This relies on supabaseClient.js being loaded first.
let supabaseClientInstance;

// Function to initialize Supabase client instance if not already done.
function initializeSupabase() {
    if (supabaseClientInstance) return supabaseClientInstance;

    if (window.supabaseClient && window.supabaseClient.supabase) {
        supabaseClientInstance = window.supabaseClient.supabase;
    } else if (typeof Supabase !== 'undefined' && typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_ANON_KEY !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
        // Fallback for standalone pages or delayed load of supabaseClient.js
        try {
            supabaseClientInstance = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            window.supabaseClient = { supabase: supabaseClientInstance }; // Make it globally available
        } catch (e) {
            console.error("Error initializing Supabase in auth.js fallback:", e);
            return null;
        }
    } else if (window.supabase && typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_ANON_KEY !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
        // Fallback for when global supabase (from CDN) is available but not our wrapper
         try {
            supabaseClientInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            window.supabaseClient = { supabase: supabaseClientInstance };
        } catch (e) {
            console.error("Error initializing Supabase in auth.js CDN fallback:", e);
            return null;
        }
    } else {
        console.error("Supabase client not found or configured. Make sure supabaseClient.js is loaded and configured before auth.js.");
    }
    return supabaseClientInstance;
}


const auth = {
    user: null,

    handleRegistration: async (event) => {
        event.preventDefault();
        const sb = initializeSupabase();
        if (!sb) {
            auth.displayMessage(document.getElementById('error-message'), 'Supabase client not initialized.');
            return;
        }

        const form = event.target;
        const email = form.email.value;
        const password = form.password.value;
        const errorMessageEl = document.getElementById('error-message');
        const successMessageEl = document.getElementById('success-message');

        auth.clearMessages(errorMessageEl, successMessageEl);

        try {
            const { data, error } = await sb.auth.signUp({
                email: email,
                password: password,
            });

            if (error) {
                console.error('Registration error:', error);
                auth.displayMessage(errorMessageEl, error.message);
                return;
            }

            // Check if user data is present and if identities array is empty (might indicate existing unconfirmed user)
            if (data.user && data.user.identities && data.user.identities.length === 0) {
                 auth.displayMessage(successMessageEl, 'Registration attempt complete. If your email is already registered but unconfirmed, please check your inbox for a confirmation link. Otherwise, try logging in.');
            } else if (data.user && data.session) { // User created and session started
                auth.displayMessage(successMessageEl, 'Registration successful! Redirecting to login...');
                 setTimeout(() => window.location.href = 'login.html', 2500);
            } else if (data.user) { // User created but no session (e.g. email confirmation required)
                 auth.displayMessage(successMessageEl, 'Registration successful! Please check your email to confirm your account, then login.');
            } else { // Fallback, should ideally not be reached if Supabase returns user or error
                auth.displayMessage(successMessageEl, 'Registration process initiated. Please follow any instructions sent to your email.');
            }
            form.reset();

        } catch (err) {
            console.error('Unexpected registration error:', err);
            auth.displayMessage(errorMessageEl, 'An unexpected error occurred during registration.');
        }
    },

    handleLogin: async (event) => {
        event.preventDefault();
        const sb = initializeSupabase();
        if (!sb) {
            auth.displayMessage(document.getElementById('error-message'), 'Supabase client not initialized.');
            return;
        }

        const form = event.target;
        const email = form.email.value;
        const password = form.password.value;
        const errorMessageEl = document.getElementById('error-message');
        auth.clearMessages(errorMessageEl);

        // --- DEVELOPMENT ONLY BYPASS ---
        // IMPORTANT: Remove this block before any deployment or sharing!
        // This bypass only works if Supabase URL is still the placeholder.
        if (typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL === 'YOUR_SUPABASE_URL') {
            if (email === 'a' && password === 'b') {
                console.warn('!!! Using placeholder login bypass !!!');
                auth.user = { id: 'local-bypass-user', email: 'a (bypass)' };
                window.location.href = 'dashboard.html';
                return; // Prevent Supabase call
            }
        }
        // --- END DEVELOPMENT ONLY BYPASS ---

        try {
            const { data, error } = await sb.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                console.error('Login error:', error);
                auth.displayMessage(errorMessageEl, error.message);
                return;
            }

            if (data.user && data.session) {
                auth.user = data.user;
                window.location.href = 'dashboard.html';
            } else {
                 auth.displayMessage(errorMessageEl, 'Login failed. Please check your credentials or confirm your email.');
            }
        } catch (err) {
            console.error('Unexpected login error:', err);
            auth.displayMessage(errorMessageEl, 'An unexpected error occurred during login.');
        }
    },

    handleLogout: async () => {
        const sb = initializeSupabase();
        if (!sb) {
            console.error('Supabase client not initialized for logout.');
            if(window.app && window.app.displayMessage) window.app.displayMessage('error-message', 'Logout failed: client not ready.');
            else alert('Logout failed: client not ready.');
            return;
        }

        try {
            const { error } = await sb.auth.signOut();
            if (error) {
                console.error('Logout error:', error);
                if(window.app && window.app.displayMessage) window.app.displayMessage('error-message', `Logout error: ${error.message}`);
                else alert(`Logout error: ${error.message}`);
                return;
            }
            auth.user = null;
            window.location.href = 'login.html';
        } catch (err) {
            console.error('Unexpected logout error:', err);
            if(window.app && window.app.displayMessage) window.app.displayMessage('error-message', 'An unexpected error occurred during logout.');
            else alert('An unexpected error occurred during logout.');
        }
    },

    checkSession: async () => {
        const sb = initializeSupabase();
        if (!sb) {
            console.warn('Supabase client not initialized for session check. Assuming no active session.');
            auth.user = null;
            return null; // Explicitly return null or handle as appropriate
        }
        try {
            const { data, error } = await sb.auth.getSession();
            if (error) {
                console.error('Error getting session:', error);
                auth.user = null;
                return null;
            }
            auth.user = data.session ? data.session.user : null;
            return data.session; // Return the session object
        } catch (err) {
            console.error('Unexpected error checking session:', err);
            auth.user = null;
            return null;
        }
    },

    getCurrentUser: () => {
        // This might be slightly delayed if checkSession hasn't completed.
        // For immediate user state, rely on the result of checkSession or onAuthStateChange.
        return auth.user;
    },

    displayMessage: (element, message) => {
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
        }
    },

    clearMessages: (...elements) => {
        elements.forEach(element => {
            if (element) {
                element.textContent = '';
                element.style.display = 'none';
            }
        });
    },

    // Listen to auth state changes
    listenForAuthStateChange: () => {
        const sb = initializeSupabase();
        if (!sb) return;

        sb.auth.onAuthStateChange((event, session) => {
            auth.user = session ? session.user : null;
            console.log("Auth state changed:", event, auth.user);

            // This is a good place to update UI globally or redirect if needed,
            // outside the context of a specific form submission.
            // For instance, if a session expires and the user is on a protected page.
            const nonAuthPages = ['login.html', 'register.html', 'index.html', '/'];
            const isAuthPage = nonAuthPages.some(page => window.location.pathname.endsWith(page));

            if (event === 'SIGNED_OUT' && !isAuthPage) {
                window.location.href = 'login.html';
            } else if (event === 'SIGNED_IN' && isAuthPage && !window.location.pathname.includes('dashboard.html')) {
                // If user signs in and they are on login/register/index, redirect to dashboard
                // This handles cases like auto-login after email confirmation link.
                // Avoid redirect if already on dashboard to prevent loop from dashboardApp.js init
                if(window.location.pathname !== '/dashboard.html' && !window.location.pathname.includes('dashboard.html')) {
                   // window.location.href = 'dashboard.html';
                }
            }

            // If app.js or dashboardApp.js have UI update functions based on auth state, call them here.
            if (window.app && typeof window.app.updateNav === 'function') {
                window.app.updateNav();
            }
            if (window.dashboardApp && typeof window.dashboardApp.handleAuthStateChange === 'function') {
                // dashboardApp might want to re-initialize or update user info
                // window.dashboardApp.handleAuthStateChange(auth.user);
            }
        });
    }
};

// Initialize Supabase client early
initializeSupabase();

// Start listening for auth state changes as soon as the script loads.
auth.listenForAuthStateChange();

// Expose auth object to global window scope
window.auth = auth;

// Add event listeners for login/register forms if on those pages
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('login.html')) {
        const loginForm = document.getElementById('login-form');
        if (loginForm) loginForm.addEventListener('submit', auth.handleLogin);

        const goToRegister = document.getElementById('go-to-register');
        if (goToRegister) goToRegister.addEventListener('click', (e) => {
            e.preventDefault(); window.location.href = 'register.html';
        });
    } else if (window.location.pathname.includes('register.html')) {
        const registerForm = document.getElementById('register-form');
        if (registerForm) registerForm.addEventListener('submit', auth.handleRegistration);

        const goToLogin = document.getElementById('go-to-login');
        if (goToLogin) goToLogin.addEventListener('click', (e) => {
            e.preventDefault(); window.location.href = 'login.html';
        });
    }
});
