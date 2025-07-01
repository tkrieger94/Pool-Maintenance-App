// js/supabaseClient.js

// IMPORTANT: Replace with your actual Supabase URL and Anon Key
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // e.g., 'https://your-project-id.supabase.co'
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // e.g., 'ey...your-anon-key...""

let supabase;

try {
    if (!SUPABASE_URL || SUPABASE_URL === 'YOUR_SUPABASE_URL') {
        console.warn('Supabase URL is not configured. Please update js/supabaseClient.js');
        throw new Error('Supabase URL is not configured.');
    }
    if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
        console.warn('Supabase Anon Key is not configured. Please update js/supabaseClient.js');
        throw new Error('Supabase Anon Key is not configured.');
    }

    supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

    if (!supabase && supabaseGlobal) { // in case window.supabase is not yet populated by CDN
        supabase = supabaseGlobal.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }


    // Expose the client to the window for global access if needed,
    // though it's better to import/require it in modules in a more complex setup.
    window.supabaseClient = { supabase };

} catch (error) {
    console.error("Error initializing Supabase client:", error.message);
    // Display a more user-friendly message on the page if possible
    const body = document.querySelector('body');
    if (body) {
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <div style="padding: 20px; background-color: #ffdddd; border: 1px solid red; text-align: center; position: fixed; top: 0; left: 0; width: 100%; z-index: 9999;">
                <strong>Configuration Error:</strong> Supabase client could not be initialized.
                Please ensure <code>js/supabaseClient.js</code> is correctly configured with your Supabase URL and Anon Key.
            </div>
        `;
        body.prepend(errorDiv);
    }
}
