# **Product Specification: UK Bin Collection Tracker**

## **1\. Executive Summary**

This project outlines a web application designed to help UK residents seamlessly track their local council bin collection days. Leveraging the open-source robbrad/UKBinCollectionData library as a backend scraping engine, the app will normalize fragmented council data. To ensure scalability, low latency, and protection against council rate-limiting, the application will use a decoupled, database-caching architecture.

## **2\. Technology Stack**

* **Frontend:** HTML/JS framework (e.g., React, Next.js, or Vue) styled with **Tailwind CSS**.  
* **Hosting:** Firebase Hosting (Static frontend).  
* **Database:** Firebase Firestore (NoSQL).  
* **Authentication:** Firebase Authentication (Email/Password \+ SSO via Google/Apple).  
* **Backend Serverless:** Google Cloud Functions (Node.js for API routes, Python for scraper/AST parser).  
* **Third-Party APIs:** Ordnance Survey (OS) Places API (for Postcode-to-UPRN resolution).  
* **Automation:** GitHub Actions (for repository monitoring).

## **3\. Frontend UX & Address Onboarding Flow**

To minimize friction and prevent unsupported users from creating useless accounts, the onboarding flow must follow a strict "Postcode-First, Auth-Second" sequence.

### **3.1. Address Resolution**

1. **Input:** A single, prominent text input for the user's postcode with auto-formatting (e.g., "LS26 8...").  
2. **Proxy Call:** Clicking "Find Address" disables the button (showing a Tailwind animate-spin loader) and triggers a request to the backend OS Places API proxy.  
3. **Selection UI:** The OS Delivery Point Address (DPA) array is parsed. The frontend constructs logical address strings (combining BUILDING\_NUMBER / THOROUGHFARE\_NAME) and presents them in a dropdown or tappable list, **strictly sorted numerically**.

### **3.2. Pre-Auth Council Validation**

Before authentication, the frontend extracts the LOCAL\_CUSTODIAN\_CODE from the selected address and checks the Firestore CouncilConfiguration registry.

* **Supported:** Show a success state ("We track bin collections for \[Council Name\]") and reveal the Firebase SSO / Email registration component.  
* **Unsupported:** Show a graceful fallback UI ("We don't currently support \[Council Name\]") with an option to submit their email to a FeatureRequests database collection.  
* **Proprietary ID Exception:** If the registry flags the council as requiring a proprietary web ID instead of a UPRN, inject a UI step with visual instructions on how to find and input this ID from the council's website.

## **4\. Core User Features**

### **4.1. Dashboard Customisation**

Users can map generic council data to their physical bins.

* **Alias Mapping:** Rename collection types (e.g., "Refuse" \-\> "Black Bin").  
* **Colour Coding:** Assign hex colours via a colour picker to specific collection types.  
* *Note: These preferences apply globally across the dashboard, calendar feeds, and push notifications.*

### **4.2. Calendar Synchronisation**

* Users can generate a unique webcal:// or .ics subscription URL.  
* **Dynamic Generation:** The calendar feed applies the user's custom aliases and colours.  
* **Default Reminders:** Users can set a default alert preference in the app (e.g., "19:00 the day before"). The backend injects standard VALARM properties into the .ics feed so calendar clients (Google, Apple, Outlook) trigger native push notifications automatically.

### **4.3. Integrations & Task Management**

* **Webhooks:** Users can configure custom Webhook URLs (for Zapier, Make, n8n, etc.) to receive JSON POST payloads when new bin days are detected or impending.  
* **JSON API:** A personal, token-secured JSON endpoint providing upcoming collections for integration into smart home dashboards (e.g., Home Assistant).

## **5\. Backend Cloud Functions**

The application requires several decoupled cloud functions to ensure security and performance:

1. **api/addressLookup (HTTP):** Securely proxies requests to the OS Places API, protecting the secret API key and enforcing server-side rate limits.  
2. **auth/onUserCreated (Trigger):** Initialises the user's Firestore profile (saving UPRN, house number, postcode), generates secure API/Calendar tokens, and triggers an immediate initial scrape for their address.  
3. **auth/onUserDeleted (Trigger):** Enforces GDPR by hard-deleting the user's profile, settings, and webhook configurations.  
4. **batch/scraperEngine (Cron):** A scheduled background worker that iterates over unique UPRNs in the database, executes the Python UKBinCollectionData scripts, and updates the cached schedule in Firestore. **Crucially, this deduplicates requests: if 15 users share a UPRN (e.g., flats), it only scrapes the council site once.**  
5. **api/icalFeed (HTTP):** Dynamically generates and serves .ics calendar files based on user tokens, injecting VALARM tags and custom aliases, with strict Cache-Control headers.  
6. **scheduled/sendReminders (Cron):** Checks for upcoming collections and dispatches Web Push notifications and third-party Webhook payloads.  
7. **scheduled/councilWatchdog (Cron):** Monitors the batch scraper for high failure rates. If a council scraper consistently fails, it automatically updates the council's status to degraded in Firestore, alerting administrators and surfacing a non-intrusive banner on affected users' dashboards.

## **6\. Council Configuration Automation (GitHub Agent)**

To handle the 300+ UK councils and their varying, frequently changing payload requirements (e.g., some need just uprn, others uprn \+ postcode), the system will automate configuration updates.

1. **Repository Sync:** A GitHub Action on a repository fork runs daily to fetch upstream updates from robbrad/UKBinCollectionData.  
2. **AST Parser Script:** A Python script runs within the GitHub Action. It uses the ast (Abstract Syntax Tree) module to parse the raw Python code of every council scraper in the directory.  
3. **Payload Extraction:** The parser specifically targets kwargs.get() calls to map exactly which arguments each council script currently requires.  
4. **Firestore Sync:** Using the Firebase Admin SDK and GitHub Secrets, the Action automatically pushes this updated JSON mapping directly to the CouncilConfiguration collection in Firestore.  
5. **Benefit:** Zero manual maintenance, zero backend hosting costs for this specific process, and immediate detection of deprecated or newly added councils.

## **7\. Cost Strategy**

Designed to utilize generous free tiers for early scaling:

* **Ordnance Survey Data Hub:** Up to £1,000/month free tier (\~60,000 postcode lookups/month).  
* **Firebase / GCP:** Free tier encompasses static hosting, 2 million Cloud Function invocations, and 50k reads/20k writes per day in Firestore. Deduplicating scrapers by UPRN strictly controls database write costs.