// Specific JavaScript for dashboard.html interactions - js/dashboardApp.js

const dashboardApp = {
    user: null,
    currentPoolId: null, // To keep track of which pool's chemicals are being viewed/edited

    init: async () => {
        // Ensure Supabase client is available
        if (typeof supabase === 'undefined') {
            if (window.supabaseClient && window.supabaseClient.supabase) {
                supabase = window.supabaseClient.supabase;
            } else {
                console.error('Supabase client is not initialized.');
                app.displayMessage('error-message', 'Supabase client not found. Please configure js/supabaseClient.js');
                return;
            }
        }

        await auth.checkSession(); // Make sure user session is current
        dashboardApp.user = auth.getCurrentUser();

        if (!dashboardApp.user) {
            window.location.href = 'login.html'; // Redirect if not logged in
            return;
        }

        dashboardApp.populateUserInfo();
        dashboardApp.attachEventListeners();
        pools.loadPools(); // Initial load of pool profiles
    },

    populateUserInfo: () => {
        const userEmailEl = document.getElementById('user-email');
        if (userEmailEl && dashboardApp.user) {
            userEmailEl.textContent = dashboardApp.user.email;
        }
    },

    attachEventListeners: () => {
        // Navigation
        document.getElementById('nav-logout')?.addEventListener('click', auth.handleLogout);
        document.getElementById('nav-dashboard')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'dashboard.html'; // Or simply reload / re-render view
        });

        // Pool Profiles
        document.getElementById('add-pool-button')?.addEventListener('click', pools.showAddPoolForm);
        document.getElementById('pool-form')?.addEventListener('submit', pools.handlePoolFormSubmit);
        document.getElementById('cancel-pool-form')?.addEventListener('click', pools.hideAddPoolForm);

        // Chemical Logs (event listeners for add/edit will be attached when pool is selected)
        document.getElementById('add-chemical-log-button')?.addEventListener('click', chemicals.showAddChemicalLogForm);
        document.getElementById('chemical-log-form')?.addEventListener('submit', chemicals.handleChemicalLogFormSubmit);
        document.getElementById('cancel-chemical-log-form')?.addEventListener('click', chemicals.hideAddChemicalLogForm);
    },

    selectPool: (poolId, poolName) => {
        dashboardApp.currentPoolId = poolId;
        document.getElementById('selected-pool-name').textContent = poolName;
        document.getElementById('chemical-logs-section').style.display = 'block';
        document.getElementById('log-pool-id').value = poolId; // Set pool_id for new logs
        chemicals.loadChemicalLogs(poolId);
    },

    clearSelectedPool: () => {
        dashboardApp.currentPoolId = null;
        document.getElementById('selected-pool-name').textContent = '';
        document.getElementById('chemical-logs-section').style.display = 'none';
        document.getElementById('chemical-log-list-container').innerHTML = '';
         document.getElementById('add-chemical-log-form-container').style.display = 'none';
    }
};

// Initialize the dashboard specific parts when the DOM is ready
// This ensures that if someone lands directly on dashboard.html (and is logged in), it initializes.
if (window.location.pathname.includes('dashboard.html')) {
    document.addEventListener('DOMContentLoaded', dashboardApp.init);
}

// Expose dashboardApp to global scope if needed by other scripts (e.g. pools.js calling dashboardApp.selectPool)
window.dashboardApp = dashboardApp;
