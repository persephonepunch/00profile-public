/**
 * Compliance Report Generator
 */

import {
  DPIAAssessment,
  ComplianceReport,
  ReportFinding,
  RiskLevel,
  StakeholderType,
} from './types.js';
import { dataStore } from './data-store.js';
import { validator, ValidationResult } from './validator.js';

export class ReportGenerator {
  generateDPIAReport(assessmentId: string): string {
    const assessment = dataStore.getDPIA(assessmentId);
    if (!assessment) {
      throw new Error(`DPIA assessment not found: ${assessmentId}`);
    }

    const validation = validator.validateAssessment(assessment);

    const sections: string[] = [];

    sections.push(this.generateHeader(assessment));
    sections.push(this.generateExecutiveSummary(assessment, validation));
    sections.push(this.generateProcessingDetails(assessment));
    sections.push(this.generateRiskAssessment(assessment));
    sections.push(this.generateMitigationMeasures(assessment));
    sections.push(this.generateNecessityTest(assessment));

    if (assessment.dataCategory === 'endowment' || assessment.dataCategory === 'mixed') {
      sections.push(this.generateEndowmentCompliance(assessment));
    }

    if (assessment.processingPurpose.includes('profit-reporting')) {
      sections.push(this.generateProfitReporting(assessment));
    }

    sections.push(this.generateComplianceStatus(validation));
    sections.push(this.generateRecommendations(validation));

    return sections.join('\n\n' + '='.repeat(80) + '\n\n');
  }

  generateComplianceReport(
    reportType: ComplianceReport['reportType'],
    startDate: string,
    endDate: string,
    stakeholder?: StakeholderType
  ): ComplianceReport {
    const assessments = dataStore.getAllDPIAs();
    const filteredAssessments = stakeholder
      ? assessments.filter(a => a.stakeholderType === stakeholder)
      : assessments;

    const validations = filteredAssessments.map(a => ({
      assessment: a,
      validation: validator.validateAssessment(a),
    }));

    const findings: ReportFinding[] = [];
    let criticalRisks = 0;

    validations.forEach(({ assessment, validation }) => {
      validation.violations.forEach(violation => {
        if (violation.severity === 'critical') criticalRisks++;

        findings.push({
          id: `${assessment.id}-${violation.ruleId}`,
          severity: this.mapSeverityToRiskLevel(violation.severity),
          category: violation.ruleTitle,
          finding: `Assessment "${assessment.name}": ${violation.description}`,
          evidence: `Rule ${violation.ruleId} violated`,
          recommendation: violation.recommendation,
        });
      });
    });

    const summary = {
      totalAssessments: filteredAssessments.length,
      compliantCount: validations.filter(v => v.validation.status === 'compliant').length,
      nonCompliantCount: validations.filter(v => v.validation.status === 'non-compliant').length,
      pendingReviewCount: validations.filter(v =>
        v.validation.status === 'pending-review' || v.validation.status === 'requires-action'
      ).length,
      criticalRisks,
    };

    const recommendations = this.generateOverallRecommendations(validations);

    const report: ComplianceReport = {
      id: `report-${Date.now()}`,
      reportType,
      generatedDate: new Date().toISOString(),
      period: { start: startDate, end: endDate },
      stakeholder: stakeholder || 'corporate',
      summary,
      findings,
      recommendations,
    };

    dataStore.saveReport(report);
    return report;
  }

  private generateHeader(assessment: DPIAAssessment): string {
    return `
DATA PROTECTION IMPACT ASSESSMENT (DPIA)
${assessment.name}

Assessment ID: ${assessment.id}
Created: ${assessment.createdDate}
Last Modified: ${assessment.lastModified}
Status: ${assessment.status}
Data Category: ${assessment.dataCategory}
Stakeholder: ${assessment.stakeholderType}
    `.trim();
  }

  private generateExecutiveSummary(assessment: DPIAAssessment, validation: ValidationResult): string {
    return `
EXECUTIVE SUMMARY

${assessment.description}

Processing Purposes:
${assessment.processingPurpose.map(p => `  - ${p}`).join('\n')}

Compliance Status: ${validation.status}
Compliance Score: ${validation.score}/100

${validation.summary}
    `.trim();
  }

  private generateProcessingDetails(assessment: DPIAAssessment): string {
    const sections = [`PROCESSING ACTIVITIES\n`];

    assessment.processingActivities.forEach((activity, index) => {
      sections.push(`${index + 1}. ${activity.name}`);
      sections.push(`   Description: ${activity.description}`);
      sections.push(`   Legal Basis: ${activity.processingBasis.legalBasis}`);
      sections.push(`   Justification: ${activity.processingBasis.justification}`);
      sections.push(`   Retention Period: ${activity.retentionPeriod}`);

      if (activity.dataSubjects.length > 0) {
        sections.push(`   Data Subjects:`);
        activity.dataSubjects.forEach(ds => {
          sections.push(`     - ${ds.category}: ${ds.description} (${ds.count} individuals)`);
          if (ds.vulnerableGroup) {
            sections.push(`       ⚠ Vulnerable group - extra safeguards required`);
          }
        });
      }

      if (activity.personalDataTypes.length > 0) {
        sections.push(`   Personal Data Types:`);
        activity.personalDataTypes.forEach(pdt => {
          const special = pdt.specialCategory ? ' [SPECIAL CATEGORY]' : '';
          const restricted = pdt.endowmentRestricted ? ' [ENDOWMENT RESTRICTED]' : '';
          sections.push(`     - ${pdt.category}: ${pdt.description} (Sensitivity: ${pdt.sensitivity})${special}${restricted}`);
        });
      }

      if (activity.transfers.length > 0) {
        sections.push(`   International Transfers:`);
        activity.transfers.forEach(transfer => {
          const approved = transfer.endowmentApproved ? '✓' : '✗';
          sections.push(`     - ${transfer.recipient} (${transfer.country})`);
          sections.push(`       Safeguards: ${transfer.safeguards}`);
          sections.push(`       Endowment Approved: ${approved}`);
        });
      }

      sections.push('');
    });

    return sections.join('\n');
  }

  private generateRiskAssessment(assessment: DPIAAssessment): string {
    const sections = [
      `RISK ASSESSMENT`,
      ``,
      `Overall Risk Level: ${assessment.riskAssessment.overallRiskLevel.toUpperCase()}`,
      `Likelihood: ${assessment.riskAssessment.likelihood}`,
      `Severity: ${assessment.riskAssessment.severity}`,
      ``,
      `Identified Risks:`,
    ];

    assessment.riskAssessment.risks.forEach((risk, index) => {
      sections.push(`\n${index + 1}. ${risk.description}`);
      sections.push(`   Category: ${risk.category}`);
      sections.push(`   Likelihood: ${risk.likelihood} | Impact: ${risk.impact}`);
      sections.push(`   Affected Stakeholders: ${risk.affectedStakeholders.join(', ')}`);
    });

    if (assessment.riskAssessment.endowmentSpecificRisks.length > 0) {
      sections.push(`\nEndowment-Specific Risks:`);
      assessment.riskAssessment.endowmentSpecificRisks.forEach((risk, index) => {
        sections.push(`\n${index + 1}. ${risk.description}`);
        sections.push(`   Likelihood: ${risk.likelihood} | Impact: ${risk.impact}`);
      });
    }

    return sections.join('\n');
  }

  private generateMitigationMeasures(assessment: DPIAAssessment): string {
    const sections = [`MITIGATION MEASURES\n`];

    assessment.mitigationMeasures.forEach((measure, index) => {
      sections.push(`${index + 1}. ${measure.measure}`);
      sections.push(`   Risk ID: ${measure.riskId}`);
      sections.push(`   Implementation: ${measure.implementation}`);
      sections.push(`   Responsible: ${measure.responsible}`);
      sections.push(`   Deadline: ${measure.deadline}`);
      sections.push(`   Status: ${measure.status}`);
      sections.push(`   Effectiveness: ${measure.effectiveness}`);
      sections.push('');
    });

    return sections.join('\n');
  }

  private generateNecessityTest(assessment: DPIAAssessment): string {
    const nt = assessment.necessityTest;

    return `
NECESSITY AND PROPORTIONALITY TEST

Purpose Specified: ${nt.purposeSpecified ? 'Yes' : 'No'}
Purpose Justification: ${nt.purposeJustification}

Adequacy Assessment:
${nt.adequacyAssessment}

Relevance Assessment:
${nt.relevanceAssessment}

Data Minimization Measures:
${nt.minimizationMeasures.map(m => `  - ${m}`).join('\n')}

Alternatives Considered:
${nt.alternativesConsidered.map(a => `  - ${a}`).join('\n')}

Endowment Consultation: ${nt.endowmentConsultation ? 'Yes' : 'No'}
${nt.endowmentConsultationNotes ? `Notes: ${nt.endowmentConsultationNotes}` : ''}
    `.trim();
  }

  private generateEndowmentCompliance(assessment: DPIAAssessment): string {
    const sections = [`ENDOWMENT STAKEHOLDER COMPLIANCE\n`];

    const prc = assessment.profitReportingCompliance;
    if (!prc) {
      sections.push('⚠ Profit reporting compliance data not available');
      return sections.join('\n');
    }

    sections.push(`Endowment Data Used: ${prc.endowmentDataUsed ? 'Yes' : 'No'}`);
    sections.push(`Corporate Data Used: ${prc.corporateDataUsed ? 'Yes' : 'No'}`);
    sections.push(`Data Separation Implemented: ${prc.dataSeparation ? '✓ Yes' : '✗ No'}`);

    if (prc.separationMechanism) {
      sections.push(`Separation Mechanism: ${prc.separationMechanism}`);
    }

    sections.push(`\nEndowment Review Date: ${prc.endowmentReviewDate || 'Not recorded'}`);
    sections.push(`Approval Status: ${prc.endowmentApprovalStatus}`);

    if (prc.transparencyMeasures.length > 0) {
      sections.push(`\nTransparency Measures:`);
      prc.transparencyMeasures.forEach(tm => sections.push(`  - ${tm}`));
    }

    if (prc.deviations.length > 0) {
      sections.push(`\n⚠ Compliance Deviations:`);
      prc.deviations.forEach((dev, index) => {
        sections.push(`\n${index + 1}. Rule: ${dev.rule}`);
        sections.push(`   Deviation: ${dev.deviation}`);
        sections.push(`   Justification: ${dev.justification}`);
        if (dev.approvedBy) {
          sections.push(`   Approved by: ${dev.approvedBy} on ${dev.approvalDate}`);
        }
      });
    }

    return sections.join('\n');
  }

  private generateProfitReporting(assessment: DPIAAssessment): string {
    const sections = [`PROFIT REPORTING GUIDELINES COMPLIANCE\n`];

    const prc = assessment.profitReportingCompliance;
    if (!prc) {
      sections.push('⚠ Profit reporting data not available');
      return sections.join('\n');
    }

    sections.push(`Applicable: ${prc.applicable ? 'Yes' : 'No'}`);

    if (prc.applicable && prc.profitAttribution) {
      sections.push(`\nProfit Attribution:`);
      sections.push(`  - Endowment Portion: ${prc.profitAttribution.endowmentPortion}%`);
      sections.push(`  - Corporate Portion: ${prc.profitAttribution.corporatePortion}%`);
      sections.push(`  - Calculation Method: ${prc.profitAttribution.calculationMethod}`);
    }

    return sections.join('\n');
  }

  private generateComplianceStatus(validation: ValidationResult): string {
    const sections = [`COMPLIANCE STATUS\n`];

    sections.push(`Overall Status: ${validation.status.toUpperCase()}`);
    sections.push(`Compliance Score: ${validation.score}/100`);
    sections.push(`Is Compliant: ${validation.isCompliant ? 'Yes' : 'No'}`);

    if (validation.violations.length > 0) {
      sections.push(`\nViolations (${validation.violations.length}):`);
      validation.violations.forEach((v, index) => {
        sections.push(`\n${index + 1}. [${v.severity.toUpperCase()}] ${v.ruleTitle}`);
        sections.push(`   Rule ID: ${v.ruleId}`);
        sections.push(`   Description: ${v.description}`);
        sections.push(`   Recommendation: ${v.recommendation}`);
      });
    }

    if (validation.warnings.length > 0) {
      sections.push(`\nWarnings (${validation.warnings.length}):`);
      validation.warnings.forEach((w, index) => {
        sections.push(`\n${index + 1}. ${w.ruleTitle}`);
        sections.push(`   Description: ${w.description}`);
        sections.push(`   Recommendation: ${w.recommendation}`);
      });
    }

    return sections.join('\n');
  }

  private generateRecommendations(validation: ValidationResult): string {
    const sections = [`RECOMMENDATIONS\n`];

    if (validation.isCompliant) {
      sections.push('This assessment is compliant with all applicable rules.');
      sections.push('\nMaintenance Recommendations:');
      sections.push('  - Conduct regular reviews of processing activities');
      sections.push('  - Update risk assessments when changes occur');
      sections.push('  - Maintain documentation of all data processing');
      sections.push('  - Ensure quarterly endowment stakeholder reviews (if applicable)');
    } else {
      sections.push('This assessment requires attention to achieve full compliance.');
      sections.push('\nPriority Actions:');

      const criticalViolations = validation.violations.filter(v => v.severity === 'critical');
      const highViolations = validation.violations.filter(v => v.severity === 'high');

      if (criticalViolations.length > 0) {
        sections.push('\nCRITICAL (Immediate Action Required):');
        criticalViolations.forEach(v => sections.push(`  - ${v.recommendation}`));
      }

      if (highViolations.length > 0) {
        sections.push('\nHIGH (Action Required Within 30 Days):');
        highViolations.forEach(v => sections.push(`  - ${v.recommendation}`));
      }
    }

    return sections.join('\n');
  }

  private mapSeverityToRiskLevel(severity: 'critical' | 'high' | 'medium' | 'low'): RiskLevel {
    return severity as RiskLevel;
  }

  private generateOverallRecommendations(
    validations: Array<{ assessment: DPIAAssessment; validation: ValidationResult }>
  ): string[] {
    const recommendations: string[] = [];

    const nonCompliant = validations.filter(v => v.validation.status === 'non-compliant');
    if (nonCompliant.length > 0) {
      recommendations.push(
        `Address ${nonCompliant.length} non-compliant assessment(s) as a priority`
      );
    }

    const criticalViolations = validations.flatMap(v =>
      v.validation.violations.filter(vio => vio.severity === 'critical')
    );
    if (criticalViolations.length > 0) {
      recommendations.push(
        `Resolve ${criticalViolations.length} critical violation(s) immediately`
      );
    }

    const endowmentAssessments = validations.filter(
      v => v.assessment.dataCategory === 'endowment' || v.assessment.dataCategory === 'mixed'
    );
    if (endowmentAssessments.length > 0) {
      recommendations.push(
        'Ensure quarterly reviews are conducted for all endowment data processing'
      );
      recommendations.push(
        'Verify data separation mechanisms are functioning correctly'
      );
    }

    recommendations.push('Conduct regular training for staff on data protection requirements');
    recommendations.push('Maintain up-to-date documentation for all processing activities');

    return recommendations;
  }
}

export const reportGenerator = new ReportGenerator();
