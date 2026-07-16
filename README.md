# n8n-nodes-ehrbase

An n8n community node for connecting to **EHRBase**, an open-source, standards-compliant Clinical Data Repository (CDR) implementing the **openEHR** specifications.

This node enables clinicians, developers, and integrators to build powerful medical automation workflows using clinical records.

---

## Features

This node covers the core openEHR REST API operations exposed by EHRBase:

### 1. EHR Management
- **Create EHR**: Initialize an EHR with an auto-generated ID or specify a custom UUID.
- **Ensure EHR Exists**: High-level workflow helper that idempotently ensures an EHR exists for a given subject ID/namespace, creating it if it doesn't.
- **Get EHR**: Retrieve EHR metadata by EHR ID or by subject identification details.

### 2. EHR Status
- **Get EHR Status**: Retrieve details regarding an EHR's queryable and modifiable states.
- **Update EHR Status**: Toggle queryable/modifiable flags and update patient self-reference objects.

### 3. Definition Management
- **Upload Template**: Post Operational Templates (OPT ADL 1.4 XML) to the CDR.
- **List/Get Templates**: Query registered templates.
- **List/Get Archetypes**: Query loaded archetypes.

### 4. Composition Management
- **Commit Record**: High-level workflow helper to write a composition based on Subject ID/Namespace directly (automatically resolving or creating the underlying EHR).
- **Create Composition**: Post clinical records (compositions) mapped to an uploaded template. Supports **Canonical JSON**, **Canonical XML**, **Flat**, and **Structured** formats.
- **Create or Update Composition**: Idempotent upsert helper that creates or updates based on the presence of a Version UID.
- **Get Composition**: Retrieve composition by its version UID.
- **Update Composition**: Modify existing compositions (requires preceding version tracking).
- **Delete Composition**: Logically delete compositions.

### 5. Directory Folder Structures
- **Create Directory**: Establish standard directory folder paths for an EHR.
- **Get or Create Directory**: Idempotent helper to fetch the root directory or create an empty one if it doesn't exist.
- **Get Directory**: Retrieve directory trees.
- **Update Directory**: Re-organize directory nodes.
- **Delete Directory**: Wipe folder records.

### 6. AQL Queries
- **Execute AQL**: Run ad-hoc **Archetype Query Language (AQL)** statements, now with native parameterization support.
- **Execute Stored**: Execute stored queries by name and version.

---

## Installation

### Community Node Installation (NPM Registry)
Once published to the NPM registry, you can install the node directly through the n8n UI:

1. Go to **Settings > Community Nodes** in n8n.
2. Click **Install a Node**.
3. Enter `n8n-nodes-ehrbase`.
4. Agree to the terms and click **Install**.

### Manual Local Installation
To load this node locally in your n8n setup:

1. Clone this repository.
2. Run `npm install` and `npm run build` to generate the compiled Javascript files in the `dist` directory.
3. Copy the contents of the `dist` folder to your custom nodes directory:
   ```bash
   cp -r dist/* ~/.n8n/custom/node_modules/n8n-nodes-ehrbase/
   ```
4. Restart your n8n process.

---

## Getting Started

### 1. Run a Local EHRBase Instance
You can boot a fully configured EHRBase CDR and PostgreSQL database using Docker Compose:

1. Save the following `docker-compose.yml` into your folder:
   ```yaml
   services:
     ehrdb:
       image: postgres:16
       environment:
         POSTGRES_DB: ehrbase
         POSTGRES_PASSWORD: ehrbase
         POSTGRES_USER: postgres
       volumes:
         - ehrdb-data:/var/lib/postgresql/data
         - ./init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
       restart: unless-stopped

     ehrbase:
       image: ehrbase/ehrbase:latest
       ports:
         - "8080:8080"
       environment:
         DB_URL: jdbc:postgresql://ehrdb:5432/ehrbase
         DB_USER: postgres
         DB_PASS: ehrbase
         DB_USER_ADMIN: postgres
         DB_PASS_ADMIN: ehrbase
         SECURITY_AUTHTYPE: NONE
       depends_on:
         - ehrdb
       restart: unless-stopped

   volumes:
     ehrdb-data:
   ```
2. Create an `init-db.sql` file in the same directory to initialize the required PostgreSQL extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```
3. Run `docker compose up -d` to start the stack. Once started, the API endpoint is available at `http://localhost:8080/ehrbase/rest/openehr/v1`.

### 2. Configure Credentials in n8n
When adding the node, configure your connection credentials:
- **Base URL**: `http://localhost:8080/ehrbase/rest/openehr/v1`
- **Auth Type**: `None` (for local development) or configure **Basic Auth** / **Bearer Token** depending on your production EHRBase security policy.

---

## Verifying the Installation

To verify that the custom node functions correctly, we have provided two testing methods in the repository:

### 1. Programmatic Integration Tests
Run our standalone Node test runner against your local active Docker EHRBase instance:
```bash
npm install --no-save axios
node test/test-integration.js
```
It will run through all 16 operations sequentially and confirm successes.

### 2. Importable n8n Workflow
We have generated a pre-configured n8n workflow file [EHRBase_Test_Workflow.json](test/EHRBase_Test_Workflow.json):
1. Copy the contents of `test/EHRBase_Test_Workflow.json`.
2. Create a new workflow in your n8n UI and paste the JSON directly into the canvas.
3. Execute the workflow to visually test every single node function.

---

## License

[MIT](LICENSE)
