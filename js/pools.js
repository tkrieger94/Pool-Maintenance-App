// js/pools.js

let supabaseClientInstancePools; // To avoid conflict if other files also declare it globally

function initializeSupabasePools() {
    if (supabaseClientInstancePools) return supabaseClientInstancePools;

    if (window.supabaseClient && window.supabaseClient.supabase) {
        supabaseClientInstancePools = window.supabaseClient.supabase;
    } else {
        console.error("Supabase client not found in pools.js. Ensure supabaseClient.js is loaded and configured.");
        // Attempt to initialize if not done (should ideally be handled by load order)
        if (typeof Supabase !== 'undefined' && typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_ANON_KEY !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
           try {
            supabaseClientInstancePools = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
             window.supabaseClient = { supabase: supabaseClientInstancePools };
           } catch(e) { console.error("Error initializing Supabase in pools.js fallback:", e); return null; }
        } else if (window.supabase && typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_ANON_KEY !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
             try {
                supabaseClientInstancePools = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                window.supabaseClient = { supabase: supabaseClientInstancePools };
            } catch(e) { console.error("Error initializing Supabase in pools.js CDN fallback:", e); return null; }
        }
    }
    return supabaseClientInstancePools;
}


const pools = {
    isLoading: false,

    loadPools: async () => {
        if (pools.isLoading) return;
        pools.isLoading = true;
        const sb = initializeSupabasePools();
        if (!sb) {
            if (window.app && window.app.displayMessage) app.displayMessage('error-message', 'Supabase not initialized. Cannot load pools.');
            else console.error('Supabase not initialized. Cannot load pools.');
            pools.isLoading = false;
            return;
        }

        const user = auth.getCurrentUser();
        if (!user) {
            if (window.app && window.app.displayMessage) app.displayMessage('error-message', 'User not logged in. Cannot load pools.');
            else console.error('User not logged in. Cannot load pools.');
            pools.isLoading = false;
            return;
        }

        const poolListContainer = document.getElementById('pool-list-container');
        if (!poolListContainer) {
            console.error("Pool list container not found.");
            pools.isLoading = false;
            return;
        }
        poolListContainer.innerHTML = '<p>Loading pools...</p>';

        try {
            const { data, error } = await sb
                .from('pool_profiles')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading pools:', error);
                if (window.app && window.app.displayMessage) app.displayMessage('error-message', `Error loading pools: ${error.message}`);
                poolListContainer.innerHTML = '<p class="error">Could not load pools.</p>';
                pools.isLoading = false;
                return;
            }

            if (data.length === 0) {
                poolListContainer.innerHTML = '<p>No pool profiles found. Add one!</p>';
            } else {
                poolListContainer.innerHTML = '';
                data.forEach(pool => {
                    const poolEl = document.createElement('div');
                    poolEl.classList.add('pool-item');
                    poolEl.innerHTML = `
                        <h4>${pool.pool_name}</h4>
                        <p>Volume: ${pool.volume || 'N/A'}</p>
                        <p>Type: ${pool.type || 'N/A'}</p>
                        <div class="actions">
                            <button class="view-chemicals-btn" data-pool-id="${pool.id}" data-pool-name="${pool.pool_name}">View Chemicals</button>
                            <button class="edit-pool-btn" data-pool-id="${pool.id}">Edit</button>
                            <button class="delete-pool-btn" data-pool-id="${pool.id}">Delete</button>
                        </div>
                    `;
                    poolListContainer.appendChild(poolEl);
                });

                poolListContainer.querySelectorAll('.view-chemicals-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const poolId = e.target.dataset.poolId;
                        const poolName = e.target.dataset.poolName;
                        if (window.dashboardApp && typeof window.dashboardApp.selectPool === 'function') {
                            window.dashboardApp.selectPool(poolId, poolName);
                        } else {
                            console.warn("dashboardApp.selectPool function not found");
                        }
                    });
                });
                poolListContainer.querySelectorAll('.edit-pool-btn').forEach(btn => {
                    btn.addEventListener('click', () => pools.editPool(btn.dataset.poolId));
                });
                poolListContainer.querySelectorAll('.delete-pool-btn').forEach(btn => {
                    btn.addEventListener('click', () => pools.deletePool(btn.dataset.poolId));
                });
            }
        } catch (err) {
            console.error('Unexpected error loading pools:', err);
            if (window.app && window.app.displayMessage) app.displayMessage('error-message', 'An unexpected error occurred while loading pools.');
            poolListContainer.innerHTML = '<p class="error">An unexpected error occurred.</p>';
        } finally {
            pools.isLoading = false;
        }
    },

    showAddPoolForm: (poolData = null) => {
        const formContainer = document.getElementById('add-pool-form-container');
        const form = document.getElementById('pool-form');
        const formTitle = formContainer.querySelector('h3');

        form.reset();
        document.getElementById('pool-id').value = '';

        if (poolData) {
            formTitle.textContent = 'Edit Pool';
            document.getElementById('pool-id').value = poolData.id;
            document.getElementById('pool-name').value = poolData.pool_name || '';
            document.getElementById('pool-volume').value = poolData.volume || '';
            document.getElementById('pool-type').value = poolData.type || '';
        } else {
            formTitle.textContent = 'Add New Pool';
        }
        formContainer.style.display = 'block';
    },

    hideAddPoolForm: () => {
        const formContainer = document.getElementById('add-pool-form-container');
        document.getElementById('pool-form').reset();
        document.getElementById('pool-id').value = '';
        formContainer.style.display = 'none';
    },

    handlePoolFormSubmit: async (event) => {
        event.preventDefault();
        if (pools.isLoading) return;
        pools.isLoading = true;

        const sb = initializeSupabasePools();
        if (!sb) {
            if (window.app && window.app.displayMessage) app.displayMessage('error-message', 'Supabase not initialized.');
            pools.isLoading = false;
            return;
        }
        const user = auth.getCurrentUser();
        if (!user) {
            if (window.app && window.app.displayMessage) app.displayMessage('error-message', 'User not logged in.');
            pools.isLoading = false;
            return;
        }

        const form = event.target;
        const poolId = form['pool-id'].value;
        const poolName = form['pool-name'].value;
        const poolVolume = form['pool-volume'].value;
        const poolType = form['pool-type'].value;

        const poolRecord = { // Renamed from poolData to avoid conflict with function arg
            user_id: user.id,
            pool_name: poolName,
            volume: poolVolume,
            type: poolType,
        };

        try {
            let response;
            if (poolId) {
                response = await sb
                    .from('pool_profiles')
                    .update(poolRecord)
                    .eq('id', poolId)
                    .eq('user_id', user.id)
                    .select();
            } else {
                response = await sb
                    .from('pool_profiles')
                    .insert(poolRecord)
                    .select();
            }

            const { data, error } = response;

            if (error) {
                console.error('Error saving pool:', error);
                if (window.app && window.app.displayMessage) app.displayMessage('error-message', `Error saving pool: ${error.message}`);
                pools.isLoading = false;
                return;
            }

            if (data && data.length > 0) {
                if (window.app && window.app.displayMessage) app.displayMessage('success-message', `Pool ${poolId ? 'updated' : 'added'} successfully!`, true);
                pools.hideAddPoolForm();
                pools.loadPools();
                 if (window.dashboardApp && typeof window.dashboardApp.clearSelectedPool === 'function' && poolId && poolId === window.dashboardApp.currentPoolId) {
                    window.dashboardApp.selectPool(data[0].id, data[0].pool_name);
                }
            } else {
                 if (window.app && window.app.displayMessage) app.displayMessage('error-message', 'Failed to save pool. No data returned.');
            }

        } catch (err) {
            console.error('Unexpected error saving pool:', err);
            if (window.app && window.app.displayMessage) app.displayMessage('error-message', 'An unexpected error occurred while saving the pool.');
        } finally {
            pools.isLoading = false;
        }
    },

    editPool: async (poolId) => {
        const sb = initializeSupabasePools();
        if (!sb) {
            if (window.app && window.app.displayMessage) app.displayMessage('error-message', 'Supabase not initialized.');
            return;
        }
        const user = auth.getCurrentUser();
        if (!user) {
            if (window.app && window.app.displayMessage) app.displayMessage('error-message', 'User not logged in.');
            return;
        }

        try {
            const { data, error } = await sb
                .from('pool_profiles')
                .select('*')
                .eq('id', poolId)
                .eq('user_id', user.id)
                .single();

            if (error) {
                console.error('Error fetching pool for edit:', error);
                if (window.app && window.app.displayMessage) app.displayMessage('error-message', `Error fetching pool details: ${error.message}`);
                return;
            }
            if (data) {
                pools.showAddPoolForm(data);
            }
        } catch (err) {
            console.error('Unexpected error fetching pool for edit:', err);
            if (window.app && window.app.displayMessage) app.displayMessage('error-message', 'An unexpected error occurred.');
        }
    },

    deletePool: async (poolId) => {
        if (!confirm('Are you sure you want to delete this pool profile? This action cannot be undone and will also delete associated chemical logs.')) {
            return;
        }
        if (pools.isLoading) return;
        pools.isLoading = true;

        const sb = initializeSupabasePools();
        if (!sb) {
            if (window.app && window.app.displayMessage) app.displayMessage('error-message', 'Supabase not initialized.');
            pools.isLoading = false;
            return;
        }
        const user = auth.getCurrentUser();
        if (!user) {
            if (window.app && window.app.displayMessage) app.displayMessage('error-message', 'User not logged in.');
            pools.isLoading = false;
            return;
        }

        try {
            // Note: RLS policies on Supabase should handle the user_id check for deletion.
            // If ON DELETE CASCADE is set for chemical_readings.pool_id, they will be auto-deleted.
            const { error } = await sb
                .from('pool_profiles')
                .delete()
                .eq('id', poolId);
                // .eq('user_id', user.id); // RLS should enforce this

            if (error) {
                console.error('Error deleting pool:', error);
                if (window.app && window.app.displayMessage) app.displayMessage('error-message', `Error deleting pool: ${error.message}`);
                pools.isLoading = false;
                return;
            }

            if (window.app && window.app.displayMessage) app.displayMessage('success-message', 'Pool deleted successfully!', true);
            pools.loadPools();
            if (window.dashboardApp && typeof window.dashboardApp.clearSelectedPool === 'function' && poolId === window.dashboardApp.currentPoolId) {
                window.dashboardApp.clearSelectedPool();
            }

        } catch (err) {
            console.error('Unexpected error deleting pool:', err);
            if (window.app && window.app.displayMessage) app.displayMessage('error-message', 'An unexpected error occurred while deleting the pool.');
        } finally {
            pools.isLoading = false;
        }
    }
};

// Expose to window
window.pools = pools;

// Initialize Supabase client early for pools.js
initializeSupabasePools();
