/**
 * Data Store for DPIA Assessments, Rules, and Guidelines
 */

import {
  DPIAAssessment,
  ComplianceRule,
  DataInventoryItem,
  ComplianceReport,
  EndowmentGuideline,
} from './types.js';

/**
 * In-memory data store (can be replaced with database)
 */
class DataStore {
  private dpiaAssessments: Map<string, DPIAAssessment> = new Map();
  private complianceRules: Map<string, ComplianceRule> = new Map();
  private dataInventory: Map<string, DataInventoryItem> = new Map();
  private complianceReports: Map<string, ComplianceReport> = new Map();
  private endowmentGuidelines: Map<string, EndowmentGuideline> = new Map();

  constructor() {
    this.initializeDefaultRules();
    this.initializeEndowmentGuidelines();
  }

  private initializeDefaultRules(): void {
    const defaultRules: ComplianceRule[] = [
      {
        id: 'gdpr-001',
        category: 'gdpr',
        title: 'DPIA Required for High-Risk Processing',
        description: 'Article 35 GDPR requires DPIA for processing likely to result in high risk',
        requirement: 'Conduct DPIA before high-risk processing activities',
        applicableDataCategories: ['endowment', 'corporate', 'mixed'],
        applicableStakeholders: ['endowment', 'corporate', 'third-party'],
        mandatory: true,
        source: 'GDPR Article 35',
        validationCriteria: [
          {
            criterion: 'Risk assessment completed',
            checkMethod: 'Verify riskAssessment object exists',
            passThreshold: 'Must be present',
          },
          {
            criterion: 'Mitigation measures defined',
            checkMethod: 'Check mitigationMeasures array',
            passThreshold: 'At least one measure per high/critical risk',
          },
        ],
      },
      {
        id: 'endow-001',
        category: 'endowment-policy',
        title: 'Endowment Data Segregation',
        description: 'All endowment stakeholder data must be segregated from corporate data',
        requirement: 'Implement technical and organizational measures to separate endowment data',
        applicableDataCategories: ['endowment', 'mixed'],
        applicableStakeholders: ['endowment'],
        mandatory: true,
        source: 'Endowment Stakeholder Policy v2.1',
        validationCriteria: [
          {
            criterion: 'Data separation implemented',
            checkMethod: 'Check profitReportingCompliance.dataSeparation',
            passThreshold: 'Must be true',
          },
          {
            criterion: 'Separation mechanism documented',
            checkMethod: 'Verify separationMechanism field',
            passThreshold: 'Must be documented',
          },
        ],
      },
      {
        id: 'endow-002',
        category: 'endowment-policy',
        title: 'Endowment Approval Required for Processing',
        description: 'Any processing of endowment data requires prior approval',
        requirement: 'Obtain written approval from endowment stakeholder before processing',
        applicableDataCategories: ['endowment', 'mixed'],
        applicableStakeholders: ['endowment'],
        mandatory: true,
        source: 'Endowment Stakeholder Agreement Section 4.2',
        validationCriteria: [
          {
            criterion: 'Approval obtained',
            checkMethod: 'Check processingBasis.endowmentApprovalRequired and endowmentApprovalDate',
            passThreshold: 'Must have approval date if required',
          },
        ],
      },
      {
        id: 'profit-001',
        category: 'profit-reporting',
        title: 'Transparent Profit Attribution',
        description: 'Profit generated from endowment data must be clearly attributed and reported',
        requirement: 'Calculate and document profit attribution between endowment and corporate sources',
        applicableDataCategories: ['endowment', 'mixed'],
        applicableStakeholders: ['endowment'],
        mandatory: true,
        source: 'Profit Reporting Guidelines v1.3',
        validationCriteria: [
          {
            criterion: 'Profit attribution calculated',
            checkMethod: 'Check profitReportingCompliance.profitAttribution',
            passThreshold: 'Must have valid calculation method and percentages',
          },
          {
            criterion: 'Transparency measures in place',
            checkMethod: 'Verify transparencyMeasures array',
            passThreshold: 'At least 2 transparency measures',
          },
        ],
      },
      {
        id: 'profit-002',
        category: 'profit-reporting',
        title: 'Quarterly Endowment Data Usage Review',
        description: 'Review and report on endowment data usage quarterly',
        requirement: 'Submit quarterly reports on data processing and profit attribution',
        applicableDataCategories: ['endowment', 'mixed'],
        applicableStakeholders: ['endowment'],
        mandatory: true,
        source: 'Profit Reporting Guidelines v1.3',
        validationCriteria: [
          {
            criterion: 'Review conducted within 90 days',
            checkMethod: 'Check endowmentReviewDate',
            passThreshold: 'Must be within last 90 days',
          },
        ],
      },
      {
        id: 'gdpr-002',
        category: 'gdpr',
        title: 'Data Minimization',
        description: 'Process only data adequate, relevant, and limited to purpose',
        requirement: 'Demonstrate data minimization in processing activities',
        applicableDataCategories: ['endowment', 'corporate', 'mixed'],
        applicableStakeholders: ['endowment', 'corporate', 'third-party'],
        mandatory: true,
        source: 'GDPR Article 5(1)(c)',
        validationCriteria: [
          {
            criterion: 'Minimization measures documented',
            checkMethod: 'Check necessityTest.minimizationMeasures',
            passThreshold: 'At least one measure documented',
          },
        ],
      },
      {
        id: 'sec-001',
        category: 'security',
        title: 'Encryption of Sensitive Data',
        description: 'All sensitive personal data must be encrypted at rest and in transit',
        requirement: 'Implement encryption for data storage and transmission',
        applicableDataCategories: ['endowment', 'corporate', 'mixed'],
        applicableStakeholders: ['endowment', 'corporate', 'third-party'],
        mandatory: true,
        source: 'Data Security Policy v3.0',
        validationCriteria: [
          {
            criterion: 'Encryption enabled',
            checkMethod: 'Check data inventory encryption status',
            passThreshold: 'Must be true for sensitive data',
          },
        ],
      },
    ];

    defaultRules.forEach(rule => this.complianceRules.set(rule.id, rule));
  }

  private initializeEndowmentGuidelines(): void {
    const guidelines: EndowmentGuideline[] = [
      {
        id: 'eg-001',
        title: 'Endowment Data Usage Policy',
        category: 'data-usage',
        description: 'Guidelines for acceptable use of endowment stakeholder data',
        requirements: [
          'Data must be used only for agreed purposes',
          'No secondary use without explicit approval',
          'Data must be segregated from corporate data systems',
          'Access limited to authorized personnel only',
          'All usage must be logged and auditable',
        ],
        prohibitions: [
          'No sale or licensing of endowment data to third parties',
          'No use for direct marketing without consent',
          'No cross-purpose data sharing',
          'No international transfers without safeguards',
        ],
        approvalProcess: 'Submit request to Endowment Data Governance Board via formal application. Decision within 15 business days.',
        reviewFrequency: 'Annually or upon material change',
        contactPerson: 'Endowment Data Protection Officer',
      },
      {
        id: 'eg-002',
        title: 'Profit Reporting Framework',
        category: 'profit-reporting',
        description: 'Framework for reporting profits derived from endowment data',
        requirements: [
          'Calculate profit attribution using approved methodologies',
          'Separate accounting for endowment-derived revenue',
          'Quarterly reporting to Endowment Stakeholder Board',
          'Annual audit of profit calculations',
          'Transparent disclosure of calculation methods',
        ],
        prohibitions: [
          'No commingling of endowment and corporate profit streams',
          'No retroactive changes to attribution methods without approval',
          'No non-disclosed fees or charges related to endowment data',
        ],
        approvalProcess: 'Annual approval of profit reporting methodology by Endowment CFO and DPO',
        reviewFrequency: 'Quarterly',
        contactPerson: 'Endowment Financial Controller',
      },
      {
        id: 'eg-003',
        title: 'Transparency and Reporting',
        category: 'transparency',
        description: 'Requirements for transparency in data processing activities',
        requirements: [
          'Maintain public-facing privacy notice for endowment stakeholders',
          'Provide detailed processing records upon request',
          'Quarterly transparency reports to stakeholder representatives',
          'Annual comprehensive data processing audit',
          'Incident notification within 24 hours',
        ],
        prohibitions: [
          'No withholding of material information',
          'No misleading statements about data practices',
        ],
        approvalProcess: 'Transparency reports reviewed by Endowment Compliance Committee',
        reviewFrequency: 'Quarterly',
        contactPerson: 'Endowment Transparency Officer',
      },
      {
        id: 'eg-004',
        title: 'Data Governance Structure',
        category: 'governance',
        description: 'Governance framework for endowment data management',
        requirements: [
          'Designated Endowment Data Protection Officer (DPO)',
          'Endowment Data Governance Board with stakeholder representation',
          'Regular data protection impact assessments',
          'Staff training on endowment data handling',
          'Documented data handling procedures',
        ],
        prohibitions: [
          'No processing without documented legal basis',
          'No delegation of DPO responsibilities without approval',
        ],
        approvalProcess: 'Governance changes approved by Endowment Stakeholder Assembly',
        reviewFrequency: 'Bi-annually',
        contactPerson: 'Endowment Governance Director',
      },
    ];

    guidelines.forEach(guideline => this.endowmentGuidelines.set(guideline.id, guideline));
  }

  // DPIA Assessments
  saveDPIA(assessment: DPIAAssessment): void {
    this.dpiaAssessments.set(assessment.id, assessment);
  }

  getDPIA(id: string): DPIAAssessment | undefined {
    return this.dpiaAssessments.get(id);
  }

  getAllDPIAs(): DPIAAssessment[] {
    return Array.from(this.dpiaAssessments.values());
  }

  deleteDPIA(id: string): boolean {
    return this.dpiaAssessments.delete(id);
  }

  // Compliance Rules
  getRule(id: string): ComplianceRule | undefined {
    return this.complianceRules.get(id);
  }

  getAllRules(): ComplianceRule[] {
    return Array.from(this.complianceRules.values());
  }

  getRulesByCategory(category: ComplianceRule['category']): ComplianceRule[] {
    return this.getAllRules().filter(rule => rule.category === category);
  }

  addRule(rule: ComplianceRule): void {
    this.complianceRules.set(rule.id, rule);
  }

  // Data Inventory
  addInventoryItem(item: DataInventoryItem): void {
    this.dataInventory.set(item.id, item);
  }

  getInventoryItem(id: string): DataInventoryItem | undefined {
    return this.dataInventory.get(id);
  }

  getAllInventory(): DataInventoryItem[] {
    return Array.from(this.dataInventory.values());
  }

  getInventoryByCategory(category: DataInventoryItem['dataCategory']): DataInventoryItem[] {
    return this.getAllInventory().filter(item => item.dataCategory === category);
  }

  // Compliance Reports
  saveReport(report: ComplianceReport): void {
    this.complianceReports.set(report.id, report);
  }

  getReport(id: string): ComplianceReport | undefined {
    return this.complianceReports.get(id);
  }

  getAllReports(): ComplianceReport[] {
    return Array.from(this.complianceReports.values());
  }

  // Endowment Guidelines
  getGuideline(id: string): EndowmentGuideline | undefined {
    return this.endowmentGuidelines.get(id);
  }

  getAllGuidelines(): EndowmentGuideline[] {
    return Array.from(this.endowmentGuidelines.values());
  }

  getGuidelinesByCategory(category: EndowmentGuideline['category']): EndowmentGuideline[] {
    return this.getAllGuidelines().filter(g => g.category === category);
  }
}

export const dataStore = new DataStore();
