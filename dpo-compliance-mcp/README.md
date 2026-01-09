# DPO Compliance MCP Server

An MCP (Model Context Protocol) server for Data Protection Impact Assessment (DPIA) management and Data Protection Officer (DPO) compliance checking, with specialized support for Endowment Stakeholder rules and profit reporting guidelines.

## Features

- **DPIA Management**: Create, validate, and manage Data Protection Impact Assessments
- **Compliance Checking**: Validate DPIAs against GDPR, Endowment Stakeholder policies, and profit reporting guidelines
- **Rules Management**: Pre-configured compliance rules with extensible framework
- **Data Inventory**: Track and categorize data (Endowment vs Corporate)
- **Report Generation**: Generate comprehensive DPIA and compliance reports
- **Endowment Guidelines**: Specialized framework for endowment stakeholder data governance

## Installation

```bash
cd dpo-compliance-mcp
npm install
```

## Usage

### Development Mode

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Install as MCP Server for Claude Code

**Project Scope (Recommended for this project):**

```bash
claude mcp add --transport stdio dpo-compliance --scope project \
  -- node /Users/yoonsunlee/00xano-bmad/dpo-compliance-mcp/dist/index.js
```

**User Scope (Available across all projects):**

```bash
claude mcp add --transport stdio dpo-compliance --scope user \
  -- node /Users/yoonsunlee/00xano-bmad/dpo-compliance-mcp/dist/index.js
```

## Available Tools

### DPIA Management

#### `create_dpia`
Create a new Data Protection Impact Assessment.

**Parameters:**
- `assessment` (object): Complete DPIA assessment data

**Example:**
```json
{
  "assessment": {
    "id": "dpia-001",
    "name": "Customer Analytics Processing",
    "description": "Processing customer data for analytics and profit reporting",
    "dataCategory": "endowment",
    "processingPurpose": ["profit-reporting", "analytics"],
    "stakeholderType": "endowment",
    "createdDate": "2025-01-15",
    "lastModified": "2025-01-15",
    "status": "pending-review",
    "processingActivities": [...],
    "riskAssessment": {...},
    "mitigationMeasures": [...],
    "necessityTest": {...},
    "profitReportingCompliance": {...}
  }
}
```

#### `get_dpia`
Retrieve a DPIA assessment by ID.

**Parameters:**
- `id` (string): DPIA assessment ID

#### `list_dpias`
List all DPIA assessments, optionally filtered by data category.

**Parameters:**
- `dataCategory` (optional): "endowment", "corporate", or "mixed"

#### `validate_dpia`
Validate a DPIA assessment against all applicable compliance rules.

**Parameters:**
- `id` (string): DPIA assessment ID to validate

**Returns:**
- Compliance status (compliant, non-compliant, pending-review, requires-action)
- Compliance score (0-100)
- List of violations with severity levels
- Warnings and recommendations

### Compliance Rules

#### `list_rules`
List compliance rules, optionally filtered by category.

**Parameters:**
- `category` (optional): "gdpr", "endowment-policy", "profit-reporting", "data-governance", or "security"

#### `get_rule`
Get details of a specific compliance rule.

**Parameters:**
- `id` (string): Rule ID (e.g., "gdpr-001", "endow-001", "profit-001")

### Data Inventory

#### `add_data_inventory`
Add an item to the data inventory for tracking Endowment vs Corporate data.

**Parameters:**
- `item` (object): Data inventory item

**Example:**
```json
{
  "item": {
    "id": "inv-001",
    "dataType": "Customer Demographics",
    "dataCategory": "endowment",
    "stakeholderOwner": "endowment",
    "location": "AWS RDS us-east-1",
    "volume": "~50,000 records",
    "classification": "confidential",
    "processingActivities": ["dpia-001"],
    "retentionPeriod": "7 years",
    "disposalMethod": "Secure deletion",
    "encryptionStatus": true,
    "accessControls": ["Role-based access", "MFA required"],
    "lastAudit": "2025-01-10"
  }
}
```

#### `list_data_inventory`
List data inventory items, optionally filtered by data category.

**Parameters:**
- `dataCategory` (optional): "endowment", "corporate", or "mixed"

### Report Generation

#### `generate_dpia_report`
Generate a comprehensive DPIA report in text format.

**Parameters:**
- `assessmentId` (string): DPIA assessment ID

**Sections Included:**
- Executive Summary
- Processing Activities Details
- Risk Assessment
- Mitigation Measures
- Necessity Test
- Endowment Compliance (if applicable)
- Profit Reporting (if applicable)
- Compliance Status with Violations
- Recommendations

#### `generate_compliance_report`
Generate a compliance report for a specific time period.

**Parameters:**
- `reportType` (string): "dpia", "profit-reporting", "endowment-audit", or "comprehensive"
- `startDate` (string): Start date in ISO format
- `endDate` (string): End date in ISO format
- `stakeholder` (optional): "endowment", "corporate", or "third-party"

**Example:**
```json
{
  "reportType": "endowment-audit",
  "startDate": "2024-10-01",
  "endDate": "2024-12-31",
  "stakeholder": "endowment"
}
```

### Endowment Guidelines

#### `list_endowment_guidelines`
List Endowment Stakeholder guidelines.

**Parameters:**
- `category` (optional): "data-usage", "profit-reporting", "transparency", or "governance"

#### `get_endowment_guideline`
Get details of a specific Endowment Stakeholder guideline.

**Parameters:**
- `id` (string): Guideline ID (e.g., "eg-001", "eg-002")

#### `check_profit_reporting_compliance`
Check if a DPIA meets profit reporting guidelines for Endowment Stakeholder.

**Parameters:**
- `assessmentId` (string): DPIA assessment ID

## Pre-configured Compliance Rules

### GDPR Rules
- **gdpr-001**: DPIA Required for High-Risk Processing (GDPR Article 35)
- **gdpr-002**: Data Minimization (GDPR Article 5(1)(c))

### Endowment Stakeholder Policies
- **endow-001**: Endowment Data Segregation - Requires technical separation of endowment data
- **endow-002**: Endowment Approval Required for Processing - Requires written approval before processing

### Profit Reporting Guidelines
- **profit-001**: Transparent Profit Attribution - Requires clear calculation and documentation
- **profit-002**: Quarterly Endowment Data Usage Review - Requires review within 90 days

### Security Policies
- **sec-001**: Encryption of Sensitive Data - Requires encryption at rest and in transit

## Endowment Stakeholder Guidelines

### Data Usage (eg-001)
Guidelines for acceptable use of endowment stakeholder data, including requirements for segregation, access controls, and audit logging.

### Profit Reporting Framework (eg-002)
Framework for calculating and reporting profits derived from endowment data, including attribution methodologies and quarterly reporting requirements.

### Transparency and Reporting (eg-003)
Requirements for transparency in data processing activities, including privacy notices, quarterly reports, and incident notification.

### Data Governance Structure (eg-004)
Governance framework requiring designated DPO, governance board, regular assessments, and staff training.

## Data Categories

### Endowment
Data belonging to or derived from endowment stakeholders. Subject to strict segregation, approval, and profit reporting requirements.

### Corporate
Data belonging to the organization. Standard GDPR and security policies apply.

### Mixed
Data combining both endowment and corporate sources. Requires profit attribution and clear separation mechanisms.

## Compliance Validation

The validator checks DPIAs against all applicable rules and returns:

### Compliance Status
- **compliant**: No critical or high violations
- **non-compliant**: Critical violations present
- **requires-action**: High violations present
- **pending-review**: Medium/low violations or warnings present

### Severity Levels
- **critical**: Immediate action required (deducts 25 points)
- **high**: Action required within 30 days (deducts 15 points)
- **medium**: Action required within 90 days (deducts 8 points)
- **low**: Should be addressed (deducts 3 points)

### Compliance Score
Score from 0-100 based on violations and warnings. A score below 70 indicates significant compliance issues.

## Example Workflow

1. **Create Data Inventory Items**
   ```
   Use add_data_inventory to track endowment and corporate data
   ```

2. **Create DPIA Assessment**
   ```
   Use create_dpia with complete assessment data
   ```

3. **Validate Against Rules**
   ```
   Use validate_dpia to check compliance
   ```

4. **Review Violations**
   ```
   Address critical and high violations first
   ```

5. **Generate Reports**
   ```
   Use generate_dpia_report for detailed documentation
   Use generate_compliance_report for periodic audits
   ```

6. **Check Profit Reporting**
   ```
   Use check_profit_reporting_compliance for endowment data
   ```

## Development

### Project Structure

```
dpo-compliance-mcp/
├── src/
│   ├── index.ts              # MCP server implementation
│   ├── types.ts              # TypeScript type definitions
│   ├── data-store.ts         # In-memory data storage
│   ├── validator.ts          # DPIA validation logic
│   └── report-generator.ts   # Report generation
├── dist/                     # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Architecture Notes

### Data Storage
Currently uses in-memory storage. For production use, replace `data-store.ts` with database persistence (PostgreSQL, MongoDB, etc.).

### Extensibility
- Add new rules to `data-store.ts` `initializeDefaultRules()`
- Add validation logic to `validator.ts` `checkRule()`
- Extend types in `types.ts` as needed

### MCP Integration
This server implements the Model Context Protocol, allowing Claude Code and other MCP clients to use compliance tools naturally in conversation.

## License

MIT

## Support

For issues or questions, refer to the MCP documentation at https://modelcontextprotocol.io
