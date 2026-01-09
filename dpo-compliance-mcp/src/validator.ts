/**
 * DPIA Validation and Compliance Checking
 */

import { DPIAAssessment, ComplianceRule, ComplianceStatus } from './types.js';
import { dataStore } from './data-store.js';

export interface ValidationResult {
  isCompliant: boolean;
  status: ComplianceStatus;
  violations: Violation[];
  warnings: Warning[];
  score: number;
  summary: string;
}

export interface Violation {
  ruleId: string;
  ruleTitle: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}

export interface Warning {
  ruleId: string;
  ruleTitle: string;
  description: string;
  recommendation: string;
}

export class DPIAValidator {
  validateAssessment(assessment: DPIAAssessment): ValidationResult {
    const violations: Violation[] = [];
    const warnings: Warning[] = [];

    const applicableRules = this.getApplicableRules(assessment);

    for (const rule of applicableRules) {
      const ruleViolations = this.checkRule(assessment, rule);
      violations.push(...ruleViolations);
    }

    const specificWarnings = this.performSpecificChecks(assessment);
    warnings.push(...specificWarnings);

    const isCompliant = violations.filter(v => v.severity === 'critical' || v.severity === 'high').length === 0;
    const status = this.determineStatus(violations, warnings);
    const score = this.calculateComplianceScore(violations, warnings);
    const summary = this.generateSummary(assessment, violations, warnings, score);

    return {
      isCompliant,
      status,
      violations,
      warnings,
      score,
      summary,
    };
  }

  private getApplicableRules(assessment: DPIAAssessment): ComplianceRule[] {
    return dataStore.getAllRules().filter(rule => {
      const categoryMatch = rule.applicableDataCategories.includes(assessment.dataCategory);
      const stakeholderMatch = rule.applicableStakeholders.includes(assessment.stakeholderType);
      return categoryMatch && stakeholderMatch;
    });
  }

  private checkRule(assessment: DPIAAssessment, rule: ComplianceRule): Violation[] {
    const violations: Violation[] = [];

    switch (rule.id) {
      case 'gdpr-001':
        violations.push(...this.checkGDPR001(assessment, rule));
        break;
      case 'endow-001':
        violations.push(...this.checkENDOW001(assessment, rule));
        break;
      case 'endow-002':
        violations.push(...this.checkENDOW002(assessment, rule));
        break;
      case 'profit-001':
        violations.push(...this.checkPROFIT001(assessment, rule));
        break;
      case 'profit-002':
        violations.push(...this.checkPROFIT002(assessment, rule));
        break;
      case 'gdpr-002':
        violations.push(...this.checkGDPR002(assessment, rule));
        break;
    }

    return violations;
  }

  private checkGDPR001(assessment: DPIAAssessment, rule: ComplianceRule): Violation[] {
    const violations: Violation[] = [];

    if (!assessment.riskAssessment) {
      violations.push({
        ruleId: rule.id,
        ruleTitle: rule.title,
        severity: 'critical',
        description: 'Risk assessment is missing',
        recommendation: 'Complete a comprehensive risk assessment including likelihood, severity, and identified risks',
      });
    }

    if (!assessment.mitigationMeasures || assessment.mitigationMeasures.length === 0) {
      violations.push({
        ruleId: rule.id,
        ruleTitle: rule.title,
        severity: 'high',
        description: 'No mitigation measures defined',
        recommendation: 'Define mitigation measures for each identified risk',
      });
    }

    const highRisks = assessment.riskAssessment?.risks?.filter(r => r.likelihood === 'high' || r.impact === 'high') || [];
    const criticalRisks = assessment.riskAssessment?.risks?.filter(r => r.likelihood === 'critical' || r.impact === 'critical') || [];

    const mitigatedRisks = new Set(assessment.mitigationMeasures?.map(m => m.riskId) || []);
    const unmitigatedHighRisks = highRisks.filter(r => !mitigatedRisks.has(r.id));
    const unmitigatedCriticalRisks = criticalRisks.filter(r => !mitigatedRisks.has(r.id));

    if (unmitigatedCriticalRisks.length > 0) {
      violations.push({
        ruleId: rule.id,
        ruleTitle: rule.title,
        severity: 'critical',
        description: `${unmitigatedCriticalRisks.length} critical risk(s) without mitigation measures`,
        recommendation: 'Define mitigation measures for all critical risks',
      });
    }

    if (unmitigatedHighRisks.length > 0) {
      violations.push({
        ruleId: rule.id,
        ruleTitle: rule.title,
        severity: 'high',
        description: `${unmitigatedHighRisks.length} high risk(s) without mitigation measures`,
        recommendation: 'Define mitigation measures for all high risks',
      });
    }

    return violations;
  }

  private checkENDOW001(assessment: DPIAAssessment, rule: ComplianceRule): Violation[] {
    const violations: Violation[] = [];

    if (assessment.dataCategory === 'endowment' || assessment.dataCategory === 'mixed') {
      if (!assessment.profitReportingCompliance) {
        violations.push({
          ruleId: rule.id,
          ruleTitle: rule.title,
          severity: 'critical',
          description: 'Profit reporting compliance section is missing for endowment data',
          recommendation: 'Add profit reporting compliance documentation',
        });
        return violations;
      }

      if (!assessment.profitReportingCompliance.dataSeparation) {
        violations.push({
          ruleId: rule.id,
          ruleTitle: rule.title,
          severity: 'critical',
          description: 'Endowment data is not segregated from corporate data',
          recommendation: 'Implement technical and organizational measures to separate endowment data',
        });
      }

      if (!assessment.profitReportingCompliance.separationMechanism) {
        violations.push({
          ruleId: rule.id,
          ruleTitle: rule.title,
          severity: 'high',
          description: 'Data separation mechanism is not documented',
          recommendation: 'Document the technical mechanism used to separate endowment data',
        });
      }
    }

    return violations;
  }

  private checkENDOW002(assessment: DPIAAssessment, rule: ComplianceRule): Violation[] {
    const violations: Violation[] = [];

    if (assessment.dataCategory === 'endowment' || assessment.dataCategory === 'mixed') {
      for (const activity of assessment.processingActivities) {
        if (activity.processingBasis.endowmentApprovalRequired && !activity.processingBasis.endowmentApprovalDate) {
          violations.push({
            ruleId: rule.id,
            ruleTitle: rule.title,
            severity: 'critical',
            description: `Processing activity "${activity.name}" requires endowment approval but no approval date provided`,
            recommendation: 'Obtain written approval from endowment stakeholder before processing',
          });
        }
      }
    }

    return violations;
  }

  private checkPROFIT001(assessment: DPIAAssessment, rule: ComplianceRule): Violation[] {
    const violations: Violation[] = [];

    if (assessment.processingPurpose.includes('profit-reporting') &&
        (assessment.dataCategory === 'endowment' || assessment.dataCategory === 'mixed')) {

      if (!assessment.profitReportingCompliance) {
        violations.push({
          ruleId: rule.id,
          ruleTitle: rule.title,
          severity: 'critical',
          description: 'Profit reporting compliance data is missing',
          recommendation: 'Add profit attribution calculation and transparency measures',
        });
        return violations;
      }

      const prc = assessment.profitReportingCompliance;

      if (!prc.profitAttribution || !prc.profitAttribution.calculationMethod) {
        violations.push({
          ruleId: rule.id,
          ruleTitle: rule.title,
          severity: 'critical',
          description: 'Profit attribution calculation method is not documented',
          recommendation: 'Document the methodology used to calculate profit attribution',
        });
      }

      const totalAttribution = (prc.profitAttribution?.endowmentPortion || 0) + (prc.profitAttribution?.corporatePortion || 0);
      if (Math.abs(totalAttribution - 100) > 0.01) {
        violations.push({
          ruleId: rule.id,
          ruleTitle: rule.title,
          severity: 'high',
          description: `Profit attribution percentages do not sum to 100% (current: ${totalAttribution}%)`,
          recommendation: 'Ensure endowment and corporate profit portions sum to exactly 100%',
        });
      }

      if (!prc.transparencyMeasures || prc.transparencyMeasures.length < 2) {
        violations.push({
          ruleId: rule.id,
          ruleTitle: rule.title,
          severity: 'medium',
          description: 'Insufficient transparency measures documented',
          recommendation: 'Document at least 2 transparency measures for profit reporting',
        });
      }
    }

    return violations;
  }

  private checkPROFIT002(assessment: DPIAAssessment, rule: ComplianceRule): Violation[] {
    const violations: Violation[] = [];

    if (assessment.dataCategory === 'endowment' || assessment.dataCategory === 'mixed') {
      if (!assessment.profitReportingCompliance?.endowmentReviewDate) {
        violations.push({
          ruleId: rule.id,
          ruleTitle: rule.title,
          severity: 'high',
          description: 'Endowment review date is not recorded',
          recommendation: 'Schedule and record quarterly endowment data usage reviews',
        });
        return violations;
      }

      const reviewDate = new Date(assessment.profitReportingCompliance.endowmentReviewDate);
      const now = new Date();
      const daysSinceReview = Math.floor((now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceReview > 90) {
        violations.push({
          ruleId: rule.id,
          ruleTitle: rule.title,
          severity: 'high',
          description: `Endowment review is overdue (last review: ${daysSinceReview} days ago)`,
          recommendation: 'Conduct quarterly review within 90 days',
        });
      }
    }

    return violations;
  }

  private checkGDPR002(assessment: DPIAAssessment, rule: ComplianceRule): Violation[] {
    const violations: Violation[] = [];

    if (!assessment.necessityTest) {
      violations.push({
        ruleId: rule.id,
        ruleTitle: rule.title,
        severity: 'high',
        description: 'Necessity and proportionality test is missing',
        recommendation: 'Complete necessity test demonstrating data minimization',
      });
      return violations;
    }

    if (!assessment.necessityTest.minimizationMeasures || assessment.necessityTest.minimizationMeasures.length === 0) {
      violations.push({
        ruleId: rule.id,
        ruleTitle: rule.title,
        severity: 'medium',
        description: 'No data minimization measures documented',
        recommendation: 'Document specific measures taken to minimize data collection',
      });
    }

    if (!assessment.necessityTest.purposeSpecified) {
      violations.push({
        ruleId: rule.id,
        ruleTitle: rule.title,
        severity: 'high',
        description: 'Processing purpose is not clearly specified',
        recommendation: 'Clearly specify the purpose of data processing',
      });
    }

    return violations;
  }

  private performSpecificChecks(assessment: DPIAAssessment): Warning[] {
    const warnings: Warning[] = [];

    if (assessment.processingActivities.length === 0) {
      warnings.push({
        ruleId: 'general',
        ruleTitle: 'Processing Activities',
        description: 'No processing activities defined',
        recommendation: 'Define at least one processing activity',
      });
    }

    if (assessment.stakeholderType === 'endowment' && !assessment.necessityTest?.endowmentConsultation) {
      warnings.push({
        ruleId: 'endow-best-practice',
        ruleTitle: 'Endowment Consultation',
        description: 'Endowment consultation not conducted',
        recommendation: 'Consider consulting with endowment stakeholders on processing necessity',
      });
    }

    if (assessment.dataCategory === 'mixed' && assessment.profitReportingCompliance) {
      const endowmentPortion = assessment.profitReportingCompliance.profitAttribution?.endowmentPortion || 0;
      if (endowmentPortion === 0 || endowmentPortion === 100) {
        warnings.push({
          ruleId: 'profit-mixed',
          ruleTitle: 'Mixed Data Attribution',
          description: 'Data category is "mixed" but profit attribution shows 100% to one category',
          recommendation: 'Verify data category classification or profit attribution calculation',
        });
      }
    }

    return warnings;
  }

  private determineStatus(violations: Violation[], warnings: Warning[]): ComplianceStatus {
    const hasCritical = violations.some(v => v.severity === 'critical');
    const hasHigh = violations.some(v => v.severity === 'high');

    if (hasCritical) {
      return 'non-compliant';
    } else if (hasHigh) {
      return 'requires-action';
    } else if (violations.length > 0 || warnings.length > 0) {
      return 'pending-review';
    }
    return 'compliant';
  }

  private calculateComplianceScore(violations: Violation[], warnings: Warning[]): number {
    let score = 100;

    violations.forEach(v => {
      switch (v.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 8;
          break;
        case 'low':
          score -= 3;
          break;
      }
    });

    warnings.forEach(() => {
      score -= 2;
    });

    return Math.max(0, score);
  }

  private generateSummary(
    assessment: DPIAAssessment,
    violations: Violation[],
    warnings: Warning[],
    score: number
  ): string {
    const lines: string[] = [];

    lines.push(`DPIA Assessment: ${assessment.name}`);
    lines.push(`Data Category: ${assessment.dataCategory}`);
    lines.push(`Stakeholder: ${assessment.stakeholderType}`);
    lines.push(`Compliance Score: ${score}/100`);
    lines.push('');

    if (violations.length === 0 && warnings.length === 0) {
      lines.push('✓ Assessment is compliant with all applicable rules');
    } else {
      if (violations.length > 0) {
        lines.push(`✗ ${violations.length} violation(s) found:`);
        const critical = violations.filter(v => v.severity === 'critical').length;
        const high = violations.filter(v => v.severity === 'high').length;
        const medium = violations.filter(v => v.severity === 'medium').length;
        const low = violations.filter(v => v.severity === 'low').length;

        if (critical > 0) lines.push(`  - Critical: ${critical}`);
        if (high > 0) lines.push(`  - High: ${high}`);
        if (medium > 0) lines.push(`  - Medium: ${medium}`);
        if (low > 0) lines.push(`  - Low: ${low}`);
      }

      if (warnings.length > 0) {
        lines.push(`⚠ ${warnings.length} warning(s) found`);
      }
    }

    return lines.join('\n');
  }
}

export const validator = new DPIAValidator();
