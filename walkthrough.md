# Walkthrough: EHRBase n8n Node

We have successfully built a complete n8n node integration for EHRBase supporting all major openEHR REST API specifications. The node compiles via TypeScript, packages assets, and compiles correctly inside WSL.

## What Was Done

We initialized the project and created the following layout:

- **Build Configs**:
  - [package.json](file:///wsl.localhost/Ubuntu/home/jonakunze/projects/vg-ehrbase-n8n/package.json): Configured with scripts for compiler settings and asset copying.
  - [tsconfig.json](file:///wsl.localhost/Ubuntu/home/jonakunze/projects/vg-ehrbase-n8n/tsconfig.json): TypeScript config targetting ES2022 with CommonJS module loading for n8n compatibility.

- **Credentials**:
  - [EHRBaseApi.credentials.ts](file:///wsl.localhost/Ubuntu/home/jonakunze/projects/vg-ehrbase-n8n/credentials/EHRBaseApi.credentials.ts): Exposes configuration for the Base URL and allows None, Basic Authentication, or Bearer Token authentication.

- **Node Implementations**:
  - [GenericFunctions.ts](file:///wsl.localhost/Ubuntu/home/jonakunze/projects/vg-ehrbase-n8n/nodes/EHRBase/GenericFunctions.ts): A wrapper handling EHRBase HTTP requests, parsing parameters, setting the correct Content-Type (handling raw XML templates, JSON, Flat, and Structured formats), and adding authorization headers.
  - [EHRBase.node.ts](file:///wsl.localhost/Ubuntu/home/jonakunze/projects/vg-ehrbase-n8n/nodes/EHRBase/EHRBase.node.ts): Core class routing executions for each resource.
  - [ehrbase.svg](file:///wsl.localhost/Ubuntu/home/jonakunze/projects/vg-ehrbase-n8n/nodes/EHRBase/ehrbase.svg): A clean custom health database logo.

- **Resource UI Fields**:
  - [EHRDescription.ts](file:///wsl.localhost/Ubuntu/home/jonakunze/projects/vg-ehrbase-n8n/nodes/EHRBase/EHRDescription.ts): EHR Create (auto or custom ID, custom status) and Get (EHR ID or Subject/Namespace ID).
  - [EHRStatusDescription.ts](file:///wsl.localhost/Ubuntu/home/jonakunze/projects/vg-ehrbase-n8n/nodes/EHRStatusDescription.ts): EHR Status Get, Get by Version, and Update (with concurrency `If-Match` header).
  - [CompositionDescription.ts](file:///wsl.localhost/Ubuntu/home/jonakunze/projects/vg-ehrbase-n8n/nodes/EHRBase/CompositionDescription.ts): Composition Create, Get, Update, and Delete. Formats supported: Standard Canonical JSON, Canonical XML, EHRBase FLAT, and STRUCTURED formats (with Template ID validation).
  - [DirectoryDescription.ts](file:///wsl.localhost/Ubuntu/home/jonakunze/projects/vg-ehrbase-n8n/nodes/EHRBase/DirectoryDescription.ts): Folder Directory Create, Get (current/versioned), Update, and Delete.
  - [QueryDescription.ts](file:///wsl.localhost/Ubuntu/home/jonakunze/projects/vg-ehrbase-n8n/nodes/EHRBase/QueryDescription.ts): Execute ad-hoc AQL queries or Stored Queries, supporting query parameters, offset, and fetch options.
  - [DefinitionDescription.ts](file:///wsl.localhost/Ubuntu/home/jonakunze/projects/vg-ehrbase-n8n/nodes/EHRBase/DefinitionDescription.ts): Definition management: Get/List Templates (ADL 1.4) and Archetypes, and Upload Template (from raw XML string or n8n binary file stream).

## Validation & Testing

1. **Compilation**:
   The code has been successfully compiled in WSL via:
   ```bash
   npm run build
   ```
   All output javascript files and assets compiled into the `/dist` directory.

2. **Integration into n8n**:
   To test the node in your local n8n instance:
   - In WSL, run:
     ```bash
     npm link
     ```
   - In your local n8n directory (e.g. `~/.n8n/custom/`), link this node package:
     ```bash
     npm link n8n-nodes-ehrbase
     ```
   - Restart n8n, and "EHRBase" will appear as a community node in your integrations library.
