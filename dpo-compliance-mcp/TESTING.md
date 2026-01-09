# Testing the DPO Compliance MCP Server

## Installation Test

After building the project, verify the installation:

```bash
# Check build output
ls -la dist/

# Verify all modules compiled
ls dist/*.js

# Expected files:
# - index.js (main server)
# - types.js (type definitions)
# - data-store.js (data storage)
# - validator.js (validation logic)
# - report-generator.js (report generation)
```

## Manual Testing

### 1. Test Server Startup

```bash
# Start the server manually
node dist/index.js
```

Expected output:
```
DPO Compliance MCP Server running on stdio
```

The server will wait for MCP protocol messages on stdin. Press `Ctrl+C` to stop.

### 2. Test with Claude Code

First, install the MCP server:

```bash
claude mcp add --transport stdio dpo-compliance --scope project \
  -- node /Users/yoonsunlee/00xano-bmad/dpo-compliance-mcp/dist/index.js
```

Verify installation:

```bash
claude mcp list
```

You should see `dpo-compliance` in the list.

## Test Scenarios

### Test 1: List Pre-configured Rules

**Ask Claude:**
```
List all compliance rules in the DPO compliance system
```

**Expected Result:**
- Should return 7 pre-configured rules
- Categories: gdpr, endowment-policy, profit-reporting, security
- All rules should have IDs, titles, and descriptions

**Validation:**
- Verify gdpr-001, gdpr-002 exist
- Verify endow-001, endow-002 exist
- Verify profit-001, profit-002 exist
- Verify sec-001 exists

---

### Test 2: View Endowment Guidelines

**Ask Claude:**
```
Show me all Endowment Stakeholder guidelines
```

**Expected Result:**
- Should return 4 guidelines
- Categories: data-usage, profit-reporting, transparency, governance
- Each should have requirements and prohibitions

**Validation:**
- eg-001: Data Usage Policy
- eg-002: Profit Reporting Framework
- eg-003: Transparency and Reporting
- eg-004: Data Governance Structure

---

### Test 3: Load and Validate Example DPIA

**Ask Claude:**
```
Load the example DPIA from example-dpia.json, create it in the system, and validate it
```

**Expected Result:**
- DPIA created successfully
- Validation shows compliant or near-compliant status
- Score should be 85-100
- No critical violations

**Check for:**
- Risk assessment present
- Mitigation measures defined
- Endowment approval documented
- Data separation implemented
- Profit attribution calculated

---

### Test 4: Create Data Inventory Item

**Ask Claude:**
```
Add a data inventory item for an endowment customer database located in AWS RDS, containing 50,000 records of confidential data with encryption enabled
```

**Expected Result:**
- Inventory item created with unique ID
- Data category should be "endowment"
- Encryption status should be true

**Validation:**
- Item appears in inventory list
- All required fields populated
- Security measures documented

---

### Test 5: Generate DPIA Report

**Ask Claude:**
```
Generate a comprehensive DPIA report for assessment dpia-example-001
```

**Expected Result:**
- Multi-section report generated
- Includes: header, executive summary, processing activities, risks, mitigations, necessity test, compliance status
- For endowment data: includes endowment compliance and profit reporting sections
- Formatted as text with clear sections

**Validation:**
- All sections present
- Data accurately reflects the assessment
- Compliance status clearly stated
- Recommendations provided

---

### Test 6: Check Profit Reporting Compliance

**Ask Claude:**
```
Check if assessment dpia-example-001 meets profit reporting guidelines
```

**Expected Result:**
- Status: COMPLIANT or specific violations listed
- Data separation status shown
- Profit attribution percentages displayed
- Approval status indicated

**Validation:**
- Checks profit-001 and profit-002 rules
- Reports specific violations if any
- Provides recommendations for violations

---

### Test 7: Generate Compliance Report

**Ask Claude:**
```
Generate a comprehensive compliance report for all assessments from 2024-10-01 to 2024-12-31
```

**Expected Result:**
- Report with summary statistics
- Total assessments, compliant count, non-compliant count
- List of findings with severity
- Overall recommendations

**Validation:**
- Report ID generated
- Period correctly set
- Summary counts accurate
- Findings categorized by severity

---

### Test 8: Create Non-Compliant DPIA

**Ask Claude:**
```
Create a DPIA for endowment data processing that is missing:
- Risk assessment
- Endowment approval
- Data separation mechanism

Then validate it to see the violations.
```

**Expected Result:**
- DPIA created
- Validation shows NON-COMPLIANT status
- Multiple CRITICAL violations reported
- Score significantly below 50

**Expected Violations:**
- Missing risk assessment (CRITICAL)
- No endowment approval date (CRITICAL)
- Data not segregated (CRITICAL)

**Validation:**
- Validator catches all critical issues
- Provides specific recommendations for each
- Status correctly set to "non-compliant"

---

### Test 9: Test Mixed Data Category

**Ask Claude:**
```
Create a DPIA with dataCategory "mixed", using both endowment and corporate data, with 60% endowment and 40% corporate profit attribution
```

**Expected Result:**
- DPIA created for mixed data
- Validation checks both endowment and corporate rules
- Profit attribution should be validated (must sum to 100%)
- Should require all endowment compliance measures

**Validation:**
- Both data sources acknowledged
- Separation mechanism required
- Profit attribution properly calculated
- No warnings about 0% or 100% attribution

---

### Test 10: Test Overdue Review

**Ask Claude:**
```
Create a DPIA with an endowmentReviewDate from 100 days ago, then validate it
```

**Expected Result:**
- DPIA created
- Validation shows HIGH violation for overdue review (profit-002)
- Status: REQUIRES-ACTION

**Expected Violation:**
- "Endowment review is overdue (last review: 100 days ago)"
- Recommendation: "Conduct quarterly review within 90 days"

---

## Integration Tests

### Test MCP Protocol Communication

The MCP server should respond correctly to MCP protocol messages:

1. **List Tools Request**
   - Server should return all 13 tools
   - Each tool should have name, description, and inputSchema

2. **Call Tool Request**
   - Server should execute the requested tool
   - Return results in proper MCP format
   - Handle errors gracefully

3. **Error Handling**
   - Invalid tool names should return error
   - Missing required parameters should return error
   - Invalid DPIA IDs should return "not found" error

---

## Performance Tests

### Large Dataset Test

1. Create 100 DPIA assessments
2. Generate compliance report for all
3. Should complete in reasonable time (< 5 seconds)

### Validation Performance

1. Validate DPIA with 50 processing activities
2. Should complete in < 1 second

---

## Edge Cases

### Edge Case 1: Exactly 90 Days Since Review
```
Create DPIA with endowmentReviewDate exactly 90 days ago
Expected: Should pass (within threshold)
```

### Edge Case 2: Exactly 91 Days Since Review
```
Create DPIA with endowmentReviewDate exactly 91 days ago
Expected: Should fail (overdue)
```

### Edge Case 3: Profit Attribution Rounding
```
Create DPIA with endowmentPortion: 33.33, corporatePortion: 66.67
Expected: Should pass (sums to 100.00 within tolerance)
```

### Edge Case 4: Empty Processing Activities
```
Create DPIA with empty processingActivities array
Expected: Warning generated, but not critical violation
```

### Edge Case 5: High Risk Without Mitigation
```
Create DPIA with high-severity risk but no corresponding mitigation measure
Expected: HIGH or CRITICAL violation
```

---

## Regression Tests

After any code changes, verify:

1. All 7 default rules still load correctly
2. All 4 endowment guidelines still load correctly
3. Validation logic still catches critical violations
4. Report generation still produces all sections
5. MCP protocol integration still works

---

## Common Issues and Solutions

### Issue: Server doesn't start
**Solution:**
- Check Node.js version (must be >= 20.0.0)
- Rebuild: `npm run build`
- Check for compilation errors

### Issue: Tools not showing in Claude Code
**Solution:**
- Verify MCP server is installed: `claude mcp list`
- Check server path is correct
- Restart Claude Code

### Issue: Validation always passes
**Solution:**
- Check validator logic in src/validator.ts
- Ensure rules are properly loaded
- Verify test DPIA has actual violations

### Issue: Reports are empty
**Solution:**
- Check if DPIA exists in dataStore
- Verify report generator has access to data
- Check for runtime errors in report generation

### Issue: TypeScript compilation errors
**Solution:**
- Run `npm install` to ensure dependencies are current
- Check tsconfig.json settings
- Verify all imports use .js extensions (ESM requirement)

---

## Manual Verification Checklist

- [ ] Server starts without errors
- [ ] All 13 tools are available
- [ ] Rules can be listed and retrieved
- [ ] Guidelines can be listed and retrieved
- [ ] DPIAs can be created
- [ ] DPIAs can be retrieved and listed
- [ ] Validation catches critical violations
- [ ] Validation produces accurate compliance scores
- [ ] DPIA reports generate all sections
- [ ] Compliance reports calculate correct statistics
- [ ] Data inventory items can be added and listed
- [ ] Profit reporting compliance checks work
- [ ] Error messages are clear and helpful
- [ ] MCP integration works with Claude Code

---

## Expected Test Results Summary

| Test | Expected Outcome | Pass/Fail |
|------|------------------|-----------|
| List Rules | 7 rules returned | |
| List Guidelines | 4 guidelines returned | |
| Load Example DPIA | Compliant, score 85-100 | |
| Create Inventory | Item created successfully | |
| Generate Report | Multi-section report | |
| Check Profit Reporting | Status displayed | |
| Generate Compliance Report | Summary with statistics | |
| Non-Compliant DPIA | Critical violations found | |
| Mixed Data DPIA | All rules checked | |
| Overdue Review | HIGH violation detected | |

---

## Test Environment Setup

**Prerequisites:**
- Node.js >= 20.0.0
- npm >= 10.0.0
- Claude Code CLI installed
- Project built successfully

**Test Data:**
- example-dpia.json (included)
- Pre-configured rules in data-store.ts
- Pre-configured guidelines in data-store.ts

**Test Tools:**
- Claude Code CLI for MCP testing
- Manual API testing (optional)
- TypeScript compiler for type checking

---

## Continuous Testing

For ongoing development:

1. Run `npm run type-check` before commits
2. Test validation logic after rule changes
3. Test report generation after format changes
4. Verify MCP integration after server changes
5. Test with real-world DPIA data periodically

---

## Next Steps After Testing

1. ✅ Verify all tests pass
2. ✅ Install as project-scope MCP server
3. ✅ Test with Claude Code in conversation
4. ✅ Create your first real DPIA
5. ✅ Generate reports for stakeholders
6. ✅ Set up quarterly review schedule
7. ✅ Train team on using the system
8. ✅ Integrate with existing compliance workflows
