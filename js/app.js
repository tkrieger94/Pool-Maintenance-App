// Main application file - js/app.js

// For this simple MVP, routing and page loading will be basic.
// A more complex SPA would use a proper router.

const app = {
    user: null,
    currentPool: null, // To keep track of which pool's chemicals are being viewed/edited

    init: async () => {
        // Check initial auth state
        await auth.checkSession();
        app.user = auth.getCurrentUser();

        // Basic router
        if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
            // Auth pages have their own specific scripts, nothing to do here for app.js
            // but ensure supabase client is available if not already by their inline scripts.
            if (typeof supabase === 'undefined' && window.supabaseClient && window.supabaseClient.supabase) {
                supabase = window.supabaseClient.supabase;
            }
            return;
        }

        // If on dashboard.html or root path (which should load dashboard content)
        if (app.user) {
            if (window.location.pathname === '/' || window.location.pathname === '/index.html' || window.location.pathname.includes('dashboard.html')) {
                 // If dashboardApp.js exists and has an init, call it.
                if (typeof dashboardApp !== 'undefined' && typeof dashboardApp.init === 'function') {
                    dashboardApp.init();
                } else {
                    // Fallback or simple dashboard loading if dashboardApp.js is not used or loaded yet
                    app.loadDashboardContent();
                }
            }
        } else {
            // If no user and not on auth pages, redirect to login
             if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('register.html')) {
                window.location.href = 'login.html';
            }
        }
    },

    loadDashboardContent: () => {
        // This function would be more relevant if index.html was the main SPA shell.
        // Since dashboard.html is separate, its specific script (dashboardApp.js) will handle its content.
        // However, we can set up common elements like navigation here if index.html is the entry point.

        const mainNav = document.getElementById('main-nav');
        const appContent = document.getElementById('app-content');

        if (!mainNav || !appContent) {
            // console.error("Required navigation or content elements not found in index.html");
            // This might happen if app.js is loaded on login.html or register.html which don't have these elements.
            return;
        }

        if (app.user) {
            mainNav.innerHTML = `
                <a href="dashboard.html" id="nav-dashboard">Dashboard</a> |
                <a href="#" id="nav-logout">Logout</a>
            `;
            document.getElementById('nav-logout').addEventListener('click', auth.handleLogout);

            // If on index.html, try to load dashboard view or redirect
            if(window.location.pathname === '/' || window.location.pathname === '/index.html'){
                // For MVP, redirecting to dashboard.html might be simpler than loading content dynamically here
                window.location.href = 'dashboard.html';
            }

        } else {
            mainNav.innerHTML = `
                <a href="login.html">Login</a> |
                <a href="register.html">Register</a>
            `;
            // If on index.html and not logged in, show login prompt or redirect
             if(window.location.pathname === '/' || window.location.pathname === '/index.html'){
                appContent.innerHTML = '<p>Please <a href="login.html">login</a> or <a href="register.html">register</a> to continue.</p>';
            }
        }
    },

    displayMessage: (elementId, message, isSuccess = false) => {
        const messageEl = document.getElementById(elementId);
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = isSuccess ? 'success' : 'error';
            messageEl.style.display = 'block';
            setTimeout(() => { messageEl.style.display = 'none'; messageEl.textContent = '';}, 5000);
        }
    }
};

// Initialize the app when the DOM is ready
document.addEventListener('DOMContentLoaded', app.init);

// Expose app to global scope for access from other files if needed (e.g. for displayMessage)
window.app = app;
