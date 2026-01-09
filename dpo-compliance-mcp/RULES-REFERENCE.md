# Compliance Rules and Guidelines Quick Reference

## Compliance Rules Overview

### GDPR Rules

#### gdpr-001: DPIA Required for High-Risk Processing
- **Source**: GDPR Article 35
- **Applies to**: All data categories, all stakeholders
- **Mandatory**: Yes
- **Requirement**: Conduct DPIA before high-risk processing activities
- **Validation Checks**:
  - Risk assessment must be present
  - At least one mitigation measure per high/critical risk
- **Severity**: Critical if violated

#### gdpr-002: Data Minimization
- **Source**: GDPR Article 5(1)(c)
- **Applies to**: All data categories, all stakeholders
- **Mandatory**: Yes
- **Requirement**: Process only adequate, relevant, and limited data
- **Validation Checks**:
  - Necessity test must be completed
  - At least one minimization measure documented
  - Purpose must be specified
- **Severity**: High if violated

---

### Endowment Stakeholder Policy Rules

#### endow-001: Endowment Data Segregation
- **Source**: Endowment Stakeholder Policy v2.1
- **Applies to**: Endowment and Mixed data
- **Mandatory**: Yes
- **Requirement**: Implement technical and organizational measures to separate endowment data
- **Validation Checks**:
  - `profitReportingCompliance.dataSeparation` must be true
  - `separationMechanism` must be documented
- **Severity**: Critical if violated
- **Common Solutions**:
  - Separate database schemas
  - Separate databases
  - Physical data separation
  - Automated tagging and validation systems

#### endow-002: Endowment Approval Required for Processing
- **Source**: Endowment Stakeholder Agreement Section 4.2
- **Applies to**: Endowment and Mixed data
- **Mandatory**: Yes
- **Requirement**: Obtain written approval from endowment stakeholder before processing
- **Validation Checks**:
  - If `processingBasis.endowmentApprovalRequired` is true, must have `endowmentApprovalDate`
- **Severity**: Critical if violated
- **Process**:
  1. Submit request to Endowment Data Governance Board
  2. Wait for written approval (typically 15 business days)
  3. Document approval date
  4. Maintain approval records

---

### Profit Reporting Guidelines

#### profit-001: Transparent Profit Attribution
- **Source**: Profit Reporting Guidelines v1.3
- **Applies to**: Endowment and Mixed data (when used for profit-reporting purpose)
- **Mandatory**: Yes
- **Requirement**: Calculate and document profit attribution between endowment and corporate sources
- **Validation Checks**:
  - `profitAttribution` must have valid calculation method
  - `endowmentPortion` + `corporatePortion` must equal 100%
  - At least 2 transparency measures documented
- **Severity**: Critical if calculation missing, High if percentages don't sum to 100%, Medium if insufficient transparency
- **Best Practices**:
  - Document methodology clearly
  - Use consistent calculation methods
  - Implement audit trails
  - Provide quarterly reports

#### profit-002: Quarterly Endowment Data Usage Review
- **Source**: Profit Reporting Guidelines v1.3
- **Applies to**: Endowment and Mixed data
- **Mandatory**: Yes
- **Requirement**: Review and report on endowment data processing quarterly
- **Validation Checks**:
  - `endowmentReviewDate` must be within last 90 days
- **Severity**: High if overdue
- **Review Checklist**:
  - Verify data separation still functioning
  - Check profit attribution accuracy
  - Review any incidents or issues
  - Update documentation
  - Submit report to Endowment Board

---

### Security Policies

#### sec-001: Encryption of Sensitive Data
- **Source**: Data Security Policy v3.0
- **Applies to**: All data categories, all stakeholders
- **Mandatory**: Yes
- **Requirement**: Implement encryption for data storage and transmission
- **Validation Checks**:
  - Data inventory items with sensitive data must have `encryptionStatus: true`
- **Severity**: High if violated
- **Implementation**:
  - Encryption at rest (AES-256 or equivalent)
  - Encryption in transit (TLS 1.2+)
  - Key management procedures
  - Regular security audits

---

## Endowment Stakeholder Guidelines

### eg-001: Endowment Data Usage Policy
- **Category**: Data Usage
- **Review Frequency**: Annually or upon material change
- **Contact**: Endowment Data Protection Officer

**Requirements**:
- Data used only for agreed purposes
- No secondary use without explicit approval
- Data segregated from corporate systems
- Access limited to authorized personnel
- All usage logged and auditable

**Prohibitions**:
- No sale or licensing to third parties
- No direct marketing without consent
- No cross-purpose data sharing
- No international transfers without safeguards

**Approval Process**: Submit to Endowment Data Governance Board, 15 business day decision

---

### eg-002: Profit Reporting Framework
- **Category**: Profit Reporting
- **Review Frequency**: Quarterly
- **Contact**: Endowment Financial Controller

**Requirements**:
- Approved calculation methodologies
- Separate accounting for endowment revenue
- Quarterly reporting to Endowment Board
- Annual audit of calculations
- Transparent disclosure of methods

**Prohibitions**:
- No commingling of profit streams
- No retroactive method changes without approval
- No non-disclosed fees related to endowment data

**Approval Process**: Annual methodology approval by Endowment CFO and DPO

---

### eg-003: Transparency and Reporting
- **Category**: Transparency
- **Review Frequency**: Quarterly
- **Contact**: Endowment Transparency Officer

**Requirements**:
- Public privacy notice for endowment stakeholders
- Detailed processing records upon request
- Quarterly transparency reports
- Annual comprehensive audit
- 24-hour incident notification

**Prohibitions**:
- No withholding material information
- No misleading statements about practices

**Approval Process**: Reports reviewed by Endowment Compliance Committee

---

### eg-004: Data Governance Structure
- **Category**: Governance
- **Review Frequency**: Bi-annually
- **Contact**: Endowment Governance Director

**Requirements**:
- Designated Endowment DPO
- Governance Board with stakeholder representation
- Regular DPIA assessments
- Staff training on endowment data handling
- Documented procedures

**Prohibitions**:
- No processing without documented legal basis
- No delegation of DPO responsibilities without approval

**Approval Process**: Governance changes approved by Endowment Stakeholder Assembly

---

## Compliance Score Impact

| Severity | Score Reduction | Action Timeline |
|----------|----------------|-----------------|
| Critical | -25 points | Immediate |
| High | -15 points | Within 30 days |
| Medium | -8 points | Within 90 days |
| Low | -3 points | Next review cycle |
| Warning | -2 points | Advisory |

**Score Ranges**:
- **85-100**: Compliant - Continue with regular monitoring
- **70-84**: Pending Review - Address issues before next review
- **50-69**: Requires Action - Develop action plan within 7 days
- **0-49**: Non-Compliant - Immediate action required, consider pausing processing

---

## Common Violation Resolutions

### "Critical: Risk assessment is missing"
**Fix**: Add complete `riskAssessment` object with:
```json
{
  "overallRiskLevel": "medium",
  "likelihood": "medium",
  "severity": "medium",
  "risks": [...],
  "endowmentSpecificRisks": [...]
}
```

### "Critical: Endowment data is not segregated"
**Fix**: Implement technical separation and document:
```json
{
  "profitReportingCompliance": {
    "dataSeparation": true,
    "separationMechanism": "Dedicated database schema with restricted access..."
  }
}
```

### "Critical: Processing requires approval but no date provided"
**Fix**: Obtain approval and document:
```json
{
  "processingBasis": {
    "endowmentApprovalRequired": true,
    "endowmentApprovalDate": "2025-01-10T00:00:00Z"
  }
}
```

### "Critical: Profit attribution missing"
**Fix**: Document profit calculation:
```json
{
  "profitAttribution": {
    "endowmentPortion": 65,
    "corporatePortion": 35,
    "calculationMethod": "Revenue tracked by data source, attributed proportionally..."
  }
}
```

### "High: Profit percentages don't sum to 100%"
**Fix**: Verify and correct percentages:
```json
{
  "profitAttribution": {
    "endowmentPortion": 60,
    "corporatePortion": 40  // Must sum to exactly 100
  }
}
```

### "High: Review is overdue"
**Fix**: Conduct review and update date:
```json
{
  "profitReportingCompliance": {
    "endowmentReviewDate": "2025-01-15T00:00:00Z"  // Within last 90 days
  }
}
```

### "High: No mitigation for high/critical risks"
**Fix**: Add mitigation measures for each risk:
```json
{
  "mitigationMeasures": [
    {
      "id": "mitigation-001",
      "riskId": "risk-001",
      "measure": "Description of mitigation",
      "implementation": "How it's implemented",
      "responsible": "Person/team responsible",
      "deadline": "2025-02-01",
      "status": "in-progress",
      "effectiveness": "high"
    }
  ]
}
```

### "Medium: Insufficient transparency measures"
**Fix**: Add at least 2 transparency measures:
```json
{
  "transparencyMeasures": [
    "Quarterly reports to Endowment Board with detailed methodology",
    "Public-facing privacy notice explaining data use",
    "Annual independent audit of processing"
  ]
}
```

---

## Rule Interaction Matrix

| Rule | Affects DPIA | Affects Inventory | Required For |
|------|--------------|-------------------|--------------|
| gdpr-001 | Yes | No | All high-risk processing |
| gdpr-002 | Yes | No | All processing |
| endow-001 | Yes | Yes | Endowment/Mixed data |
| endow-002 | Yes | No | Endowment/Mixed data |
| profit-001 | Yes | No | Profit reporting purpose |
| profit-002 | Yes | No | Endowment/Mixed data |
| sec-001 | No | Yes | All sensitive data |

---

## Checklist for Compliant Endowment Processing

- [ ] Endowment approval obtained and documented
- [ ] Data separation mechanism implemented
- [ ] Separation mechanism documented in DPIA
- [ ] Risk assessment completed
- [ ] Mitigation measures defined for all high/critical risks
- [ ] Necessity test completed with minimization measures
- [ ] Profit attribution methodology documented
- [ ] Profit percentages sum to exactly 100%
- [ ] At least 2 transparency measures implemented
- [ ] Initial endowment review date set (within 90 days)
- [ ] Data inventory items created with encryption status
- [ ] Access controls documented
- [ ] Consultation with Endowment Board completed
- [ ] Quarterly review schedule established

---

## Contact Information for Endowment Stakeholder

- **Data Protection Officer**: Endowment Data Protection Officer
- **Data Governance**: Endowment Governance Director
- **Financial Matters**: Endowment Financial Controller
- **Transparency**: Endowment Transparency Officer
- **Approval Requests**: Endowment Data Governance Board

**Review Bodies**:
- Endowment Data Governance Board (data processing approvals)
- Endowment Compliance Committee (transparency reports)
- Endowment Stakeholder Assembly (governance changes)
- Endowment CFO & DPO (profit methodology approval)
