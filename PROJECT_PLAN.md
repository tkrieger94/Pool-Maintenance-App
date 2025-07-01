# Project Plan: Pool Maintenance App

## 1. Overview

This document outlines the features and actionable tasks for developing a Pool Maintenance App. The goal is to create a system that helps users manage their pool's maintenance schedule, chemical balance, and supplies.

**Assumed Technology Stack:**
*   **Backend & Database:** Supabase (PostgreSQL, Authentication, Instant APIs, Edge Functions)
*   **Frontend:** HTML, CSS, JavaScript (Potentially a framework like Vue.js, React, Svelte, or Angular, using Supabase client libraries)

## 2. Core Features & Actionable Tasks

### 2.1. User Authentication (Leveraging Supabase Auth)
*   **Description:** Allow users to create accounts, log in, and manage their sessions using Supabase's built-in authentication.
*   **Tasks:**
    *   [ ] **Task 2.1.1:** Configure Supabase Authentication settings (e.g., enable email/password auth, social providers if desired, email templates).
    *   [ ] **Task 2.1.2:** Integrate Supabase client SDK for user registration (sign-up with email and password).
    *   [ ] **Task 2.1.3:** Integrate Supabase client SDK for user login (sign-in with email and password).
    *   [ ] **Task 2.1.4:** Integrate Supabase client SDK for user logout.
    *   [ ] **Task 2.1.5 (Optional):** Implement Supabase "Forgot Password" functionality (uses Supabase's email-based password reset).
    *   [ ] **Task 2.1.6:** Create basic UI forms for registration, login, and password reset.
    *   [ ] **Task 2.1.7:** Implement frontend logic to handle user sessions and protected routes based on Supabase auth state.
    *   [ ] **Task 2.1.8:** Test authentication flows (registration, login, logout, password reset). Note: Supabase handles underlying auth logic testing; focus on integration testing.

### 2.2. Pool Profile Management (Utilizing Supabase Database & APIs)
*   **Description:** Allow users to add and manage details for one or more pools. Data stored in Supabase.
*   **Tasks:**
    *   [ ] **Task 2.2.1:** Design `pool_profiles` table schema in Supabase (e.g., `id`, `user_id` (references `auth.users`), `pool_name`, `volume`, `type`, `location`, `notes`, `main_image_url`, `created_at`). Implement Row Level Security (RLS) policies.
    *   [ ] **Task 2.2.2:** Implement frontend logic using Supabase client SDK to perform CRUD operations (Create, Read, Update, Delete) on `pool_profiles`.
    *   [ ] **Task 2.2.3:** Create UI for users to add a new pool profile (form interacting with Supabase SDK).
    *   [ ] **Task 2.2.4:** Create UI to display a list of user's pools (fetching data via Supabase SDK).
    *   [ ] **Task 2.2.5:** Create UI to view/edit details of a specific pool (interacting with Supabase SDK).
    *   [ ] **Task 2.2.6:** Test CRUD operations for pool profiles through the UI and SDK integration.

### 2.3. Maintenance Task Scheduling (Utilizing Supabase Database & APIs)
*   **Description:** Allow users to create, view, update, and delete recurring or one-off maintenance tasks. Data stored in Supabase.
*   **Tasks:**
    *   [ ] **Task 2.3.1:** Design `maintenance_tasks` table schema in Supabase (e.g., `id`, `pool_id` (references `pool_profiles`), `task_name`, `description`, `frequency_type`, `due_date`, `completed_status`, `last_completed_date`, `created_at`). Implement RLS policies.
    *   [ ] **Task 2.3.2:** Implement frontend logic using Supabase client SDK for CRUD operations on `maintenance_tasks`.
    *   [ ] **Task 2.3.3:** Implement client-side or Supabase Edge Function logic for handling recurring tasks (e.g., auto-generating next due date upon completion and updating the record).
    *   [ ] **Task 2.3.4:** Create UI to add/edit a maintenance task (including frequency options, interacting with Supabase SDK).
    *   [ ] **Task 2.3.5:** Create UI to display upcoming and overdue tasks for a pool (fetching and filtering data via Supabase SDK).
    *   [ ] **Task 2.3.6:** Create UI to mark tasks as complete (updating records via Supabase SDK).
    *   [ ] **Task 2.3.7:** Test task scheduling functionality (creation, completion, recurrence) through UI and SDK integration.

### 2.4. Chemical Reading Logs (Utilizing Supabase Database & APIs)
*   **Description:** Allow users to log and track chemical readings for their pools. Data stored in Supabase.
*   **Tasks:**
    *   [ ] **Task 2.4.1:** Design `chemical_readings` table schema in Supabase (e.g., `id`, `pool_id` (references `pool_profiles`), `date_recorded`, `ph_level`, `chlorine_level`, `alkalinity_level`, `calcium_hardness`, `cyanuric_acid`, `notes`, `created_at`). Implement RLS policies.
    *   [ ] **Task 2.4.2:** Implement frontend logic using Supabase client SDK to log new chemical readings.
    *   [ ] **Task 2.4.3:** Implement frontend logic using Supabase client SDK to retrieve historical chemical readings for a pool.
    *   [ ] **Task 2.4.4:** Create UI form to submit new chemical readings (interacting with Supabase SDK).
    *   [ ] **Task 2.4.5:** Create UI to display a history of chemical readings (table or simple chart, fetching data via Supabase SDK).
    *   [ ] **Task 2.4.6:** Test logging and retrieving chemical readings through UI and SDK integration.

### 2.5. Supply/Inventory Tracking (Basic, Utilizing Supabase Database & APIs)
*   **Description:** Allow users to track common pool supplies. Data stored in Supabase.
*   **Tasks:**
    *   [ ] **Task 2.5.1:** Design `supplies` table schema in Supabase (e.g., `id`, `user_id` (references `auth.users`), `item_name`, `current_quantity`, `desired_quantity`, `unit`, `notes`, `created_at`). Implement RLS policies.
    *   [ ] **Task 2.5.2:** Implement frontend logic using Supabase client SDK for CRUD operations on `supplies`.
    *   [ ] **Task 2.5.3:** Create UI to add/edit supply items (interacting with Supabase SDK).
    *   [ ] **Task 2.5.4:** Create UI to display current inventory (fetching data via Supabase SDK).
    *   [ ] **Task 2.5.5:** Test supply tracking CRUD operations through UI and SDK integration.

### 2.6. Notifications & Reminders (Basic, Leveraging Supabase)
*   **Description:** Notify users about upcoming maintenance tasks or low inventory.
*   **Tasks:**
    *   [ ] **Task 2.6.1:** Design logic for identifying due tasks or low supplies (this could be a Supabase Edge Function run on a schedule, or client-side logic on app load/refresh).
    *   [ ] **Task 2.6.2:** If using Edge Functions:
        *   [ ] **Task 2.6.2.1:** Develop a Supabase Edge Function to query tasks due soon and supplies below desired quantity.
        *   [ ] **Task 2.6.2.2:** Schedule the Edge Function (e.g., using Supabase's cron scheduling for functions or an external scheduler).
    *   [ ] **Task 2.6.3:** Implement in-app notification display (e.g., a toast message, a notification badge/area in the UI).
    *   [ ] **Task 2.6.4 (Optional):** For email notifications:
        *   [ ] **Task 2.6.4.1:** Choose and configure an email service provider (e.g., SendGrid, Resend - Supabase has guides for some).
        *   [ ] **Task 2.6.4.2:** Develop a Supabase Edge Function that triggers emails via the chosen service based on notification criteria.
    *   [ ] **Task 2.6.5:** Test notification logic (e.g., creating test data that should trigger notifications and verifying the outcome).

### 2.7. Basic Reporting (Utilizing Supabase for Data & Client-Side for Rendering)
*   **Description:** Provide users with simple reports based on their data, fetched via Supabase SDK.
*   **Tasks:**
    *   [ ] **Task 2.7.1:** Design a simple report for chemical reading history over time (e.g., line chart for pH and Chlorine for the last 30 days).
    *   [ ] **Task 2.7.2:** Implement frontend logic using Supabase client SDK to fetch data for the chemical history report.
    *   [ ] **Task 2.7.3:** Create UI to display the chemical history report (using a charting library if needed, e.g., Chart.js, D3.js).
    *   [ ] **Task 2.7.4:** Design a simple report for maintenance task completion (e.g., percentage of tasks completed on time in the last month).
    *   [ ] **Task 2.7.5:** Implement frontend logic using Supabase client SDK to fetch and process data for the task completion report.
    *   [ ] **Task 2.7.6:** Create UI to display the task completion report.
    *   [ ] **Task 2.7.7:** Test report data fetching and display.

## 3. General Tasks & Project Setup (Supabase Focused)

*   [ ] **Task 3.1:** Initialize frontend project structure (e.g., Vite, Create React App, or basic HTML/CSS/JS).
*   [ ] **Task 3.2:** Set up Supabase project (create project in Supabase dashboard, note API keys and URL).
*   [ ] **Task 3.3:** Install and configure Supabase client SDK in the frontend project.
*   [ ] **Task 3.4:** Design and implement initial database schema (tables, columns, relationships, RLS policies) within Supabase. Consider using Supabase schema migrations if managing schema as code.
*   [ ] **Task 3.5:** Implement basic error handling and logging in the frontend application, including handling Supabase API errors.
*   [ ] **Task 3.6:** Create a basic responsive layout/stylesheet for the application.
*   [ ] **Task 3.7:** Write/update `README.md` for the project, detailing Supabase setup, frontend environment setup, running, and testing instructions.

## 4. Future Enhancements (Post MVP)

*   Advanced reporting and analytics.
*   Integration with weather APIs for advice.
*   Barcode scanning for supplies.
*   Community features or sharing pool maintenance tips.
*   Mobile application (Native or PWA).
*   Integration with smart pool devices.

---

This plan provides a structured approach to building the Pool Maintenance App. Each task can be assigned and tracked, allowing for incremental development.
