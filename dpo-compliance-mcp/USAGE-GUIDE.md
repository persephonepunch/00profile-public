# DPO Compliance MCP Server - Usage Guide

## Quick Start

1. **Install dependencies**
   ```bash
   cd dpo-compliance-mcp
   npm install
   ```

2. **Build the server**
   ```bash
   npm run build
   ```

3. **Install for Claude Code**
   ```bash
   claude mcp add --transport stdio dpo-compliance --scope project \
     -- node /Users/yoonsunlee/00xano-bmad/dpo-compliance-mcp/dist/index.js
   ```

4. **Verify installation**
   ```bash
   claude mcp list
   ```

## Using with Claude Code

Once installed, you can use the DPO compliance tools in natural conversation with Claude Code:

### Example Conversations

#### Creating a DPIA

**You:** "I need to create a DPIA for processing endowment customer data for profit reporting"

**Claude:** *Uses the pre-configured example or helps you build one from scratch*

#### Validating Compliance

**You:** "Can you validate DPIA dpia-example-001 and tell me if it's compliant?"

**Claude:** *Uses `validate_dpia` tool and explains the results*

#### Checking Profit Reporting

**You:** "Check if our endowment data processing meets profit reporting guidelines"

**Claude:** *Uses `check_profit_reporting_compliance` tool*

#### Generating Reports

**You:** "Generate a comprehensive DPIA report for assessment dpia-example-001"

**Claude:** *Uses `generate_dpia_report` tool*

## Understanding Endowment Stakeholder Requirements

### Key Concepts

**Endowment Stakeholder** refers to an organization or group that has provided endowment funding and requires:
- Strict data segregation from corporate data
- Transparent profit attribution and reporting
- Prior approval for data processing activities
- Quarterly reviews and audits

### Critical Rules for Endowment Data

1. **Data Segregation (endow-001)**
   - Technical separation required (separate schemas, databases, or systems)
   - Document the separation mechanism
   - Implement automated checks to prevent commingling

2. **Prior Approval (endow-002)**
   - All processing requires written approval
   - Document approval date
   - Maintain approval records

3. **Profit Attribution (profit-001)**
   - Calculate percentage of profit from endowment data
   - Document calculation methodology
   - Implement transparency measures
   - Ensure percentages sum to 100%

4. **Quarterly Reviews (profit-002)**
   - Review every 90 days
   - Update endowmentReviewDate
   - Document any changes or issues

## Data Categories Explained

### Endowment Data
- Data belonging to endowment stakeholders
- Subject to ALL endowment rules
- Requires strictest controls
- 100% endowment profit attribution

### Corporate Data
- Organization's own data
- Subject to GDPR and security policies
- Standard controls
- 100% corporate profit attribution

### Mixed Data
- Combines endowment and corporate sources
- Subject to ALL endowment rules PLUS additional scrutiny
- Requires documented separation mechanism
- Requires clear profit attribution split (not 0% or 100%)

## Compliance Status Levels

### Compliant ✓
- No critical or high violations
- Score typically 85-100
- Ready for production use
- Regular monitoring recommended

### Pending Review ⚠
- Minor violations or warnings only
- Score typically 70-84
- Address issues before next review
- Safe to proceed with caution

### Requires Action ⚠⚠
- High severity violations present
- Score typically 50-69
- Address within 30 days
- Consider pausing risky activities

### Non-Compliant ✗
- Critical violations present
- Score below 50
- Immediate action required
- Do not proceed with processing

## Working with Rules

### View All Rules
```
"List all compliance rules"
```

Claude will use `list_rules` to show all available rules.

### View Rules by Category
```
"Show me all endowment policy rules"
"What are the profit reporting rules?"
```

Claude will use `list_rules` with appropriate category filter.

### Understanding a Specific Rule
```
"Explain rule endow-001"
"What does profit-002 require?"
```

Claude will use `get_rule` to fetch details and explain.

## Data Inventory Management

Track where endowment and corporate data is stored:

### Adding Inventory Items
```
"Add a data inventory item for customer database in AWS"
```

Claude will help create an inventory item with:
- Data type and category (endowment/corporate/mixed)
- Location and volume
- Security measures (encryption, access controls)
- Related DPIA assessments

### Reviewing Inventory
```
"Show me all endowment data in our inventory"
"List all data inventory items"
```

Claude will use `list_data_inventory` with appropriate filters.

## Generating Reports

### DPIA Report
Comprehensive report for a specific assessment:
```
"Generate a DPIA report for dpia-example-001"
```

Includes:
- Executive summary
- Processing details
- Risk assessment
- Mitigation measures
- Compliance status
- Recommendations

### Compliance Report
Periodic audit report across multiple assessments:
```
"Generate an endowment audit report for Q4 2024"
```

Specify:
- Report type (dpia, profit-reporting, endowment-audit, comprehensive)
- Time period (start and end dates)
- Stakeholder filter (optional)

## Best Practices

### 1. Start with Data Inventory
Before creating DPIAs, document what data you have:
- Identify endowment vs corporate data
- Document locations and security measures
- Establish clear ownership

### 2. Obtain Approvals First
For endowment data processing:
- Submit formal request to Endowment Data Governance Board
- Wait for written approval
- Document approval date in DPIA
- Keep approval records accessible

### 3. Implement Separation Mechanisms
Technical measures for data segregation:
- Separate database schemas or databases
- Different access credentials
- Automated tagging systems
- Cross-contamination checks
- Regular audits of separation

### 4. Document Everything
Maintain comprehensive documentation:
- Processing purposes and legal basis
- Risk assessments and mitigation
- Profit calculation methodologies
- Consultation and approval records
- Review dates and findings

### 5. Regular Reviews
Schedule and conduct reviews:
- Quarterly endowment data reviews (required)
- Annual comprehensive DPIA reviews
- Immediate review when processing changes
- Post-incident reviews

### 6. Address Violations Promptly
When validation finds issues:
- Critical: Stop processing, address immediately
- High: Action plan within 7 days, resolve within 30 days
- Medium: Action plan within 30 days, resolve within 90 days
- Low: Address in next regular review cycle

## Common Scenarios

### Scenario 1: New Endowment Processing Activity

1. Check endowment guidelines: `list_endowment_guidelines`
2. Review applicable rules: `list_rules` with category "endowment-policy"
3. Submit approval request to Endowment Board
4. Create DPIA with approval date
5. Implement separation mechanisms
6. Validate DPIA: `validate_dpia`
7. Address any violations
8. Generate report for stakeholders
9. Schedule first quarterly review

### Scenario 2: Quarterly Endowment Review

1. List all endowment DPIAs: `list_dpias` with dataCategory "endowment"
2. Check each for overdue reviews
3. Validate each DPIA: `validate_dpia`
4. Generate compliance report: `generate_compliance_report` for quarter
5. Update review dates
6. Document findings and actions
7. Submit report to Endowment Board

### Scenario 3: Profit Reporting

1. Ensure data separation is implemented
2. Document calculation methodology
3. Calculate attribution percentages (must sum to 100%)
4. Implement transparency measures (minimum 2)
5. Check compliance: `check_profit_reporting_compliance`
6. Generate profit reporting report
7. Submit to Endowment Board
8. Schedule quarterly follow-up

### Scenario 4: Mixed Data Processing

1. Identify endowment and corporate data sources
2. Document separation mechanism
3. Calculate profit attribution split
4. Obtain endowment approval
5. Create DPIA with dataCategory "mixed"
6. Implement technical separation
7. Validate: `validate_dpia`
8. Verify attribution percentages are reasonable (not 0% or 100%)
9. Generate report

## Troubleshooting

### "Critical violation: Risk assessment is missing"
Create a complete riskAssessment object with:
- overallRiskLevel
- likelihood and severity
- risks array with identified risks
- endowmentSpecificRisks if applicable

### "Critical violation: Endowment data is not segregated"
Set in profitReportingCompliance:
- dataSeparation: true
- separationMechanism: "document your technical mechanism"

### "Critical violation: No approval date provided"
In processingBasis:
- endowmentApprovalRequired: true
- endowmentApprovalDate: "YYYY-MM-DD"

### "High violation: Endowment review is overdue"
Update profitReportingCompliance:
- endowmentReviewDate: "recent date within 90 days"

### "High violation: Profit attribution percentages do not sum to 100%"
Check profitAttribution:
- endowmentPortion + corporatePortion must equal exactly 100

## Advanced Topics

### Custom Rules
To add organization-specific rules:
1. Edit `src/data-store.ts`
2. Add rule to `initializeDefaultRules()`
3. Edit `src/validator.ts`
4. Add validation logic to `checkRule()`
5. Rebuild: `npm run build`

### Database Integration
Replace in-memory storage:
1. Edit `src/data-store.ts`
2. Replace Map storage with database calls
3. Implement persistence layer (PostgreSQL, MongoDB, etc.)
4. Maintain same interface for compatibility

### Custom Report Formats
Extend report generation:
1. Edit `src/report-generator.ts`
2. Add new report generation methods
3. Update MCP tool definitions in `src/index.ts`
4. Rebuild and test

## Support and Resources

- MCP Documentation: https://modelcontextprotocol.io
- GDPR Information: https://gdpr.eu
- ICO DPIA Guidance: https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/accountability-and-governance/data-protection-impact-assessments/

## Version History

- v1.0.0: Initial release with DPIA management, validation, reporting, and endowment stakeholder support
