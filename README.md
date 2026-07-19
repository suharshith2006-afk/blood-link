# Blood Link 🩸🛡️

A live, full-stack database-driven health communication network engineered as a centralized emergency blood matching portal. Developed with an elegant, responsive design system, this platform bridges a highly interactive frontend dashboard layout with a cloud-hosted PHP execution engine and a relational MySQL database to achieve real-time donor telemetry tracking, dynamic session lifecycle controls, and live multi-tier location-based donor discovery matching across the entire city of Kakinada.

## 🚀 Live Demo
🌐 Explore the Live Full-Stack Cloud Deployment: http://blood-link.gt.tc/

---

## 📋 Project Overview
Developed as a 3rd-Year B.Tech CSE Community Service Project, this application represents a fully integrated, production-ready medical donor and recipient communication ecosystem. Moving beyond static client-side layouts, this multi-role architecture establishes a full-stack pipeline capable of securely handling active data transmissions from anywhere in the world, including mobile smartphone devices. The platform processes raw donor/recipient registrations, maps them onto backend validation modules, cross-references inputs against parameterized database records, and securely routes users into a protected search panel ledger to seamlessly find emergency blood units near their locations, filtered by Localities and area zones in Kakinada.

---

## 💡 Key Features
* **Natively Unified Runtime Architecture:** Unified frontend interfaces and backend script components hosted entirely within a single cloud-provisioned subfolder to bypass cross-origin boundaries and ensure zero transmission blocks.
* **Asynchronous Telemetry Pipelines:** Utilizes modern JavaScript asynchronous `fetch` requests to continuously transmit real-time JSON payloads to backend processors, updating dashboard telemetry charts smoothly without page refreshes.
* **Defensive Server-Side Data Sanitation:** Implements strict validation and filtering layers in PHP using PDO to sanitize inputs, manage structural multi-role account paths, and isolate SQL exceptions securely.
* **Dynamic Vector Telemetry Visualization:** Integrates responsive SVG engines on the dashboard to translate database rows into real-time linear trend lines, dynamic distribution donuts, and active donor registration meters automatically.
* **Persistent Session Lifecycle Tracking:** Integrates native backend session protocols (`session_start()`) to protect internal blood ledger database searches and prevent unauthorized guests from bypassing system security gates.
* **Multi-Role Profiling Matrix:** Tailor-made workflows for both **Donors** (managing medical availability and location states) and **Recipients** (posting urgent hospital requests) to organize regional coordination cleanly.

---

## 🛠️ Technology Stack & Tools Used
* **User-Interface Layer:** HTML5 (Semantic State Viewports, Responsive Vector SVGs, Layout Grid Architectures) & CSS3 (Root Design Tokens, Interactive Keyframes, Micro-Transitions, Light/Dark Theme Utilities)
* **Client Telemetry Engine:** JavaScript (ES6+ Form Interception, Asynchronous Fetch, JSON Packet Serialization, DOM Mutation Handlers, Event Lifecycle Hooks)
* **Backend Processing Module:** PHP (Object-Oriented Architecture, Session State Management, JSON Communication Interfaces)
* **Database Infrastructure:** MySQL (InnoDB Engine, Relational Tables, Structured Query Strings, Data Indexing Controls)
* **Deployment Environments:** InfinityFree Production Web Cluster, phpMyAdmin Cloud Hub, XAMPP Local Server Environment

---

## 📂 Project Directory Structure

```text
blood-link/
│
├── index.html         # Main entry viewport shell housing multi-role layout states (Login/Signup/Home)
├── style.css          # Design tokens, root color parameters, and interactive dashboard layout parameters
├── script.js          # Core async telemetry logic, chart vector scripts, and server-side request routing
│
├── db.php             # Production Remote Data Connector Module running strict PDO error handling
├── check_session.php  # Active session state gatekeeper verifying cookie verification tokens on load
├── get_stats.php      # Live analytics engine compiling real-time database counts for dashboard charts
├── login.php          # Central API hub managing secure credential matching and role validation routing
├── logout.php         # Safe session teardown module flushing active browser credentials cleanly
├── register.php       # Input sanitation and parameterized insertion controller handling donor/recipient accounts
├── search.php         # Secure blood ledger search index pulling location-specific donor rows
└── contact.php        # Form endpoint mapping public message queries straight into text storage records
```

---

### ⚙️ Local Deployment & Execution

To clone and execute this full-stack project locally within a development environment:

#### 1. Environment Setup
* Download and install **XAMPP** (enabling Apache and MySQL modules).
* Copy the project folder into your local target directory: `C:\xampp\htdocs\blood-link`.

#### 2. Database Migration
* Open your browser and navigate to the local controller panel: http://localhost/phpmyadmin/.
* Create a fresh database named `blood_link`.
* Click the **Import** tab, choose your database structure schema `.sql` backup file exported from the project directory, and click **Go**.

#### 3. Execution & Mobile Testing
* Launch the Apache and MySQL modules in your XAMPP Control Panel.
* Access the local deployment hub directly through your desktop browser at: `http://localhost/blood-link/`.
* **Mobile Phone Testing:** To load the interactive portal directly onto your mobile smartphone device:
  1. Ensure your mobile phone and host computer are connected to the exact same local Wi-Fi network interface.
  2. Open your computer's terminal or command prompt, run the `ipconfig` execution query, and locate your machine's unique **IPv4 Address** (e.g., `192.168.1.XX`).
  3. Open your mobile smartphone browser and navigate directly to your local wireless server endpoint path: `http://YOUR_LOCAL_IP/blood-link/`.

---

### ⚖️ Legal & Academic Disclosure

Developed as a B.Tech Computer Science and Engineering portfolio asset and Community Service Project evaluation challenge. This software is distributed in the hope that it will be useful for demonstrating modern database integration, secure asynchronous communication design, and live deployment best practices, without any implied warranty of merchantability or fitness for a particular production environment. 

All rights reserved © 2026. Authorized for full-stack system evaluation and academic project presentation review.
