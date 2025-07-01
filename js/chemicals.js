// js/chemicals.js

let supabaseClientInstanceChemicals;

function initializeSupabaseChemicals() {
    if (supabaseClientInstanceChemicals) return supabaseClientInstanceChemicals;

    if (window.supabaseClient && window.supabaseClient.supabase) {
        supabaseClientInstanceChemicals = window.supabaseClient.supabase;
    } else {
        console.error("Supabase client not found in chemicals.js. Ensure supabaseClient.js is loaded and configured.");
        if (typeof Supabase !== 'undefined' && typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_ANON_KEY !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
            try {
                supabaseClientInstanceChemicals = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                window.supabaseClient = { supabase: supabaseClientInstanceChemicals };
            } catch(e) { console.error("Error initializing Supabase in chemicals.js fallback:", e); return null; }
        } else if (window.supabase && typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_ANON_KEY !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
             try {
                supabaseClientInstanceChemicals = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                window.supabaseClient = { supabase: supabaseClientInstanceChemicals };
            } catch(e) { console.error("Error initializing Supabase in chemicals.js CDN fallback:", e); return null; }
        }
    }
    return supabaseClientInstanceChemicals;
}

const chemicals = {
    isLoading: false,
    currentPoolIdForLogs: null,

    loadChemicalLogs: async (poolId) => {
        if (!poolId) {
            console.warn("loadChemicalLogs called without poolId");
            const logListContainer = document.getElementById('chemical-log-list-container');
            if(logListContainer) logListContainer.innerHTML = '<p>Select a pool to see its chemical logs.</p>';
            return;
        }
        chemicals.currentPoolIdForLogs = poolId;

        if (chemicals.isLoading) return;
        chemicals.isLoading = true;

        const sb = initializeSupabaseChemicals();
        if (!sb) {
            if(window.app && window.app.displayMessage) app.displayMessage('error-message', 'Supabase not initialized. Cannot load chemical logs.');
            chemicals.isLoading = false;
            return;
        }

        const user = auth.getCurrentUser();
        if (!user) {
            if(window.app && window.app.displayMessage) app.displayMessage('error-message', 'User not logged in. Cannot load chemical logs.');
            chemicals.isLoading = false;
            return;
        }

        const logListContainer = document.getElementById('chemical-log-list-container');
        if (!logListContainer) {
            console.error("Chemical log list container not found.");
            chemicals.isLoading = false;
            return;
        }
        logListContainer.innerHTML = `<p>Loading chemical logs...</p>`;
        const logPoolIdField = document.getElementById('log-pool-id');
        if (logPoolIdField) logPoolIdField.value = poolId;

        try {
            const { data, error } = await sb
                .from('chemical_readings')
                .select('*')
                .eq('pool_id', poolId)
                .eq('user_id', user.id)
                .order('date_recorded', { ascending: false });

            if (error) {
                console.error('Error loading chemical logs:', error);
                if(window.app && window.app.displayMessage) app.displayMessage('error-message', `Error loading chemical logs: ${error.message}`);
                logListContainer.innerHTML = '<p class="error">Could not load chemical logs.</p>';
                chemicals.isLoading = false;
                return;
            }

            if (data.length === 0) {
                logListContainer.innerHTML = '<p>No chemical logs found for this pool. Add one!</p>';
            } else {
                logListContainer.innerHTML = '';
                data.forEach(log => {
                    const logEl = document.createElement('div');
                    logEl.classList.add('chemical-log-item');
                    const formattedDate = new Date(log.date_recorded + 'T00:00:00Z').toLocaleDateString(undefined, { timeZone: 'UTC' });


                    logEl.innerHTML = `
                        <h4>Reading on: ${formattedDate}</h4>
                        <p>pH: ${log.ph_level !== null ? log.ph_level : 'N/A'}</p>
                        <p>Chlorine: ${log.chlorine_level !== null ? log.chlorine_level + ' ppm' : 'N/A'}</p>
                        <p>Alkalinity: ${log.alkalinity_level !== null ? log.alkalinity_level + ' ppm' : 'N/A'}</p>
                        <p>Notes: ${log.notes || 'N/A'}</p>
                        <div class="actions">
                            <button class="edit-log-btn" data-log-id="${log.id}">Edit</button>
                            <button class="delete-log-btn" data-log-id="${log.id}">Delete</button>
                        </div>
                    `;
                    logListContainer.appendChild(logEl);
                });

                logListContainer.querySelectorAll('.edit-log-btn').forEach(btn => {
                    btn.addEventListener('click', () => chemicals.editChemicalLog(btn.dataset.logId));
                });
                logListContainer.querySelectorAll('.delete-log-btn').forEach(btn => {
                    btn.addEventListener('click', () => chemicals.deleteChemicalLog(btn.dataset.logId));
                });
            }
        } catch (err) {
            console.error('Unexpected error loading chemical logs:', err);
            if(window.app && window.app.displayMessage) app.displayMessage('error-message', 'An unexpected error occurred while loading chemical logs.');
            logListContainer.innerHTML = '<p class="error">An unexpected error occurred.</p>';
        } finally {
            chemicals.isLoading = false;
        }
    },

    showAddChemicalLogForm: (logData = null) => {
        const formContainer = document.getElementById('add-chemical-log-form-container');
        const form = document.getElementById('chemical-log-form');
        const formTitle = formContainer.querySelector('h3');

        form.reset();
        document.getElementById('log-id').value = '';

        const currentPoolForForm = chemicals.currentPoolIdForLogs || (window.dashboardApp && window.dashboardApp.currentPoolId);
        const logPoolIdField = document.getElementById('log-pool-id');
        if (logPoolIdField) logPoolIdField.value = currentPoolForForm;


        if (logData) {
            formTitle.textContent = 'Edit Chemical Log';
            document.getElementById('log-id').value = logData.id;
            if (logPoolIdField) logPoolIdField.value = logData.pool_id;
            document.getElementById('log-date').value = logData.date_recorded;
            document.getElementById('ph-level').value = logData.ph_level || '';
            document.getElementById('chlorine-level').value = logData.chlorine_level || '';
            document.getElementById('alkalinity-level').value = logData.alkalinity_level || '';
            document.getElementById('log-notes').value = logData.notes || '';
        } else {
            formTitle.textContent = 'Add New Chemical Log';
            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const day = today.getDate().toString().padStart(2, '0');
            document.getElementById('log-date').value = `${year}-${month}-${day}`;
        }
        if(formContainer) formContainer.style.display = 'block';
    },

    hideAddChemicalLogForm: () => {
        const formContainer = document.getElementById('add-chemical-log-form-container');
        if(formContainer) {
            document.getElementById('chemical-log-form').reset();
            document.getElementById('log-id').value = '';
            formContainer.style.display = 'none';
        }
    },

    handleChemicalLogFormSubmit: async (event) => {
        event.preventDefault();
        if (chemicals.isLoading) return;
        chemicals.isLoading = true;

        const sb = initializeSupabaseChemicals();
        if (!sb) {
            if(window.app && window.app.displayMessage) app.displayMessage('error-message', 'Supabase not initialized.');
            chemicals.isLoading = false;
            return;
        }
        const user = auth.getCurrentUser();
        if (!user) {
            if(window.app && window.app.displayMessage) app.displayMessage('error-message', 'User not logged in.');
            chemicals.isLoading = false;
            return;
        }

        const form = event.target;
        const logId = form['log-id'].value;
        const poolId = form['log-pool-id'].value;
        const dateRecorded = form['log-date'].value;
        const phLevel = form['ph-level'].value;
        const chlorineLevel = form['chlorine-level'].value;
        const alkalinityLevel = form['alkalinity-level'].value;
        const notes = form['log-notes'].value;

        if (!poolId) {
            if(window.app && window.app.displayMessage) app.displayMessage('error-message', 'No pool selected for this chemical log.');
            chemicals.isLoading = false;
            return;
        }

        const logRecord = {
            user_id: user.id,
            pool_id: poolId,
            date_recorded: dateRecorded,
            ph_level: phLevel !== '' ? parseFloat(phLevel) : null,
            chlorine_level: chlorineLevel !== '' ? parseFloat(chlorineLevel) : null,
            alkalinity_level: alkalinityLevel !== '' ? parseInt(alkalinityLevel) : null,
            notes: notes,
        };

        try {
            let response;
            if (logId) {
                response = await sb
                    .from('chemical_readings')
                    .update(logRecord)
                    .eq('id', logId)
                    .eq('user_id', user.id)
                    .select();
            } else {
                response = await sb
                    .from('chemical_readings')
                    .insert(logRecord)
                    .select();
            }
            const { data, error } = response;

            if (error) {
                console.error('Error saving chemical log:', error);
                if(window.app && window.app.displayMessage) app.displayMessage('error-message', `Error saving chemical log: ${error.message}`);
                chemicals.isLoading = false;
                return;
            }

            if (data && data.length > 0) {
                if(window.app && window.app.displayMessage) app.displayMessage('success-message', `Chemical log ${logId ? 'updated' : 'added'} successfully!`, true);
                chemicals.hideAddChemicalLogForm();
                chemicals.loadChemicalLogs(poolId);
            } else {
                 if(window.app && window.app.displayMessage) app.displayMessage('error-message', 'Failed to save chemical log. No data returned.');
            }

        } catch (err) {
            console.error('Unexpected error saving chemical log:', err);
            if(window.app && window.app.displayMessage) app.displayMessage('error-message', 'An unexpected error occurred while saving the chemical log.');
        } finally {
            chemicals.isLoading = false;
        }
    },

    editChemicalLog: async (logId) => {
        const sb = initializeSupabaseChemicals();
        if (!sb) {
            if(window.app && window.app.displayMessage) app.displayMessage('error-message', 'Supabase not initialized.');
            return;
        }
        const user = auth.getCurrentUser();
        if (!user) {
            if(window.app && window.app.displayMessage) app.displayMessage('error-message', 'User not logged in.');
            return;
        }

        try {
            const { data, error } = await sb
                .from('chemical_readings')
                .select('*')
                .eq('id', logId)
                .eq('user_id', user.id)
                .single();

            if (error) {
                console.error('Error fetching log for edit:', error);
                if(window.app && window.app.displayMessage) app.displayMessage('error-message', `Error fetching log details: ${error.message}`);
                return;
            }
            if (data) {
                chemicals.currentPoolIdForLogs = data.pool_id;
                chemicals.showAddChemicalLogForm(data);
            }
        } catch (err) {
            console.error('Unexpected error fetching log for edit:', err);
            if(window.app && window.app.displayMessage) app.displayMessage('error-message', 'An unexpected error occurred.');
        }
    },

    deleteChemicalLog: async (logId) => {
        if (!confirm('Are you sure you want to delete this chemical log?')) {
            return;
        }
        if (chemicals.isLoading) return;
        chemicals.isLoading = true;

        const sb = initializeSupabaseChemicals();
        if (!sb) {
            if(window.app && window.app.displayMessage) app.displayMessage('error-message', 'Supabase not initialized.');
            chemicals.isLoading = false;
            return;
        }
        const user = auth.getCurrentUser();
        if (!user) {
            if(window.app && window.app.displayMessage) app.displayMessage('error-message', 'User not logged in.');
            chemicals.isLoading = false;
            return;
        }

        try {
            const { error } = await sb
                .from('chemical_readings')
                .delete()
                .eq('id', logId);
                // .eq('user_id', user.id); // RLS should enforce this

            if (error) {
                console.error('Error deleting chemical log:', error);
                if(window.app && window.app.displayMessage) app.displayMessage('error-message', `Error deleting chemical log: ${error.message}`);
                chemicals.isLoading = false;
                return;
            }

            if(window.app && window.app.displayMessage) app.displayMessage('success-message', 'Chemical log deleted successfully!', true);

            const currentPoolId = chemicals.currentPoolIdForLogs || (window.dashboardApp && window.dashboardApp.currentPoolId);
            if (currentPoolId) {
                chemicals.loadChemicalLogs(currentPoolId);
            } else {
                const logListContainer = document.getElementById('chemical-log-list-container');
                if(logListContainer) logListContainer.innerHTML = '';
            }

        } catch (err) {
            console.error('Unexpected error deleting chemical log:', err);
            if(window.app && window.app.displayMessage) app.displayMessage('error-message', 'An unexpected error occurred while deleting the log.');
        } finally {
            chemicals.isLoading = false;
        }
    }
};

window.chemicals = chemicals;
initializeSupabaseChemicals(); // Initialize early
