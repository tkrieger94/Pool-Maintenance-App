# Pool Maintenance App - MVP

This is the Minimum Viable Product (MVP) for the Pool Maintenance App. It allows users to register, log in, manage profiles for their pools, and log chemical readings for each pool.

## Features (MVP)

*   **User Authentication:**
    *   User registration (email/password).
    *   User login and logout.
    *   Session management.
*   **Pool Profile Management:**
    *   Create, Read, Update, and Delete (CRUD) pool profiles.
    *   Each pool profile can store a name, volume, and type (e.g., Chlorine, Saltwater).
*   **Chemical Reading Logs:**
    *   CRUD operations for chemical readings associated with a pool.
    *   Log date, pH level, chlorine level, alkalinity level, and notes.

## Technology Stack

*   **Backend:** [Supabase](https://supabase.io/)
    *   PostgreSQL Database
    *   Authentication
    *   Instant APIs (used via Supabase client library)
*   **Frontend:**
    *   HTML
    *   CSS (basic styling)
    *   JavaScript (vanilla JS for application logic)
    *   [Supabase Client Library (supabase-js)](https://supabase.com/docs/library/js/getting-started)

## Project Structure

```
.
├── css/
│   └── style.css         # Basic application styling
├── js/
│   ├── app.js            # Main application logic, routing
│   ├── auth.js           # User authentication functions
│   ├── chemicals.js      # CRUD for chemical readings
│   ├── dashboardApp.js   # Logic specific to dashboard.html
│   ├── pools.js          # CRUD for pool profiles
│   └── supabaseClient.js # Supabase client initialization (NEEDS CONFIGURATION)
├── dashboard.html        # Main application dashboard (after login)
├── index.html            # Entry point, redirects or shows login/register links
├── login.html            # User login page
├── register.html         # User registration page
├── PROJECT_PLAN.md       # Original high-level project plan
├── README.md             # This file
└── SUPABASE_SCHEMA.md    # Details on Supabase tables and RLS policies
```

## Setup and Configuration

### 1. Supabase Project Setup

*   Go to [Supabase.io](https://supabase.io/) and create a new project.
*   Once your project is created, you will need your Project URL and `anon` public key.
*   **Database Schema:**
    *   Navigate to the "Table Editor" in your Supabase project dashboard.
    *   Create the tables (`pool_profiles`, `chemical_readings`) as defined in `SUPABASE_SCHEMA.md`.
    *   **Important:** Set up the Row Level Security (RLS) policies for each table as described in `SUPABASE_SCHEMA.md`. Enable RLS for each table. This is crucial for data security.
*   **Authentication:**
    *   Navigate to "Authentication" -> "Providers" in your Supabase dashboard.
    *   Ensure "Email" provider is enabled.
    *   (Optional) Disable "Confirm email" for easier testing during MVP development if desired (Authentication -> Settings). If you leave it enabled, users will need to confirm their email before they can log in.

### 2. Frontend Configuration

*   **Edit `js/supabaseClient.js`:**
    *   Open the file `js/supabaseClient.js`.
    *   Replace `'YOUR_SUPABASE_URL'` with your actual Supabase Project URL.
    *   Replace `'YOUR_SUPABASE_ANON_KEY'` with your actual Supabase `anon` public key.

    ```javascript
    // js/supabaseClient.js
    const SUPABASE_URL = 'https://your-project-id.supabase.co'; // <-- REPLACE THIS
    const SUPABASE_ANON_KEY = 'eyYourAnonKey...'; // <-- REPLACE THIS
    // ... rest of the file
    ```

### 3. Running the Application

*   Since this is a vanilla HTML, CSS, and JavaScript application without a build step for the MVP, you can run it by:
    1.  **Using a simple HTTP server:**
        *   If you have Python installed, navigate to the project's root directory in your terminal and run:
            *   Python 3: `python -m http.server`
            *   Python 2: `python -m SimpleHTTPServer`
        *   Then open your browser and go to `http://localhost:8000` (or the port indicated by the server).
    2.  **Using a live server extension in your code editor:**
        *   Many code editors (like VS Code) have extensions (e.g., "Live Server") that can serve HTML files locally.
    3.  **Directly opening `index.html` (Not Recommended for Supabase Auth):**
        *   While you *can* open `index.html` directly in some browsers, this might lead to issues with Supabase authentication or certain browser security policies when using `file:///` URLs. Using a local server is highly recommended.

## Development Notes

*   **Error Handling:** Basic error messages are displayed on forms or in designated error areas on the page. More robust error handling could be added.
*   **Styling:** Styling is intentionally minimal for the MVP.
*   **No Build Step:** The MVP uses vanilla JavaScript and directly includes the Supabase client via CDN for simplicity. Future development might introduce a build system (e.g., Vite, Webpack) and a frontend framework (Vue, React, Svelte).
*   **Expandability:** The JavaScript files are somewhat modularized (`auth.js`, `pools.js`, `chemicals.js`) to make it easier to add more features or refactor later. The `PROJECT_PLAN.md` outlines many potential future enhancements.

## Contributing (Placeholder)

Details on how to contribute to the project would go here if it were an open-source project.
For now, this is a demonstration MVP.

---

This README provides the necessary information to get the MVP version of the Pool Maintenance App running. Remember to configure your Supabase backend correctly, especially the RLS policies.