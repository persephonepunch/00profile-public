/**
 * Data Protection Impact Assessment (DPIA) and DPO Compliance Types
 */

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type DataCategory = 'endowment' | 'corporate' | 'mixed';
export type ProcessingPurpose = 'profit-reporting' | 'analytics' | 'marketing' | 'operations' | 'compliance';
export type ComplianceStatus = 'compliant' | 'non-compliant' | 'pending-review' | 'requires-action';
export type StakeholderType = 'endowment' | 'corporate' | 'third-party';

/**
 * DPIA Assessment Structure
 */
export interface DPIAAssessment {
  id: string;
  name: string;
  description: string;
  dataCategory: DataCategory;
  processingPurpose: ProcessingPurpose[];
  stakeholderType: StakeholderType;
  createdDate: string;
  lastModified: string;
  status: ComplianceStatus;
  processingActivities: ProcessingActivity[];
  riskAssessment: RiskAssessment;
  mitigationMeasures: MitigationMeasure[];
  necessityTest: NecessityTest;
  profitReportingCompliance?: ProfitReportingCompliance;
}

/**
 * Processing Activity
 */
export interface ProcessingActivity {
  id: string;
  name: string;
  description: string;
  dataSubjects: DataSubject[];
  personalDataTypes: PersonalDataType[];
  processingBasis: ProcessingBasis;
  retentionPeriod: string;
  recipients: string[];
  transfers: DataTransfer[];
}

/**
 * Data Subjects
 */
export interface DataSubject {
  category: string;
  description: string;
  vulnerableGroup: boolean;
  count: number | 'unknown';
  stakeholderAffiliation: StakeholderType;
}

/**
 * Personal Data Types
 */
export interface PersonalDataType {
  category: string;
  description: string;
  specialCategory: boolean;
  sensitivity: RiskLevel;
  endowmentRestricted: boolean;
}

/**
 * Processing Basis (GDPR Article 6)
 */
export interface ProcessingBasis {
  legalBasis: 'consent' | 'contract' | 'legal-obligation' | 'vital-interests' | 'public-task' | 'legitimate-interests';
  justification: string;
  endowmentApprovalRequired: boolean;
  endowmentApprovalDate?: string;
}

/**
 * Data Transfers
 */
export interface DataTransfer {
  recipient: string;
  country: string;
  safeguards: string;
  endowmentApproved: boolean;
}

/**
 * Risk Assessment
 */
export interface RiskAssessment {
  overallRiskLevel: RiskLevel;
  risks: Risk[];
  likelihood: RiskLevel;
  severity: RiskLevel;
  endowmentSpecificRisks: Risk[];
}

export interface Risk {
  id: string;
  description: string;
  likelihood: RiskLevel;
  impact: RiskLevel;
  category: 'privacy' | 'security' | 'compliance' | 'reputational' | 'financial';
  affectedStakeholders: StakeholderType[];
}

/**
 * Mitigation Measures
 */
export interface MitigationMeasure {
  id: string;
  riskId: string;
  measure: string;
  implementation: string;
  responsible: string;
  deadline: string;
  status: 'planned' | 'in-progress' | 'implemented' | 'verified';
  effectiveness: RiskLevel;
}

/**
 * Necessity and Proportionality Test
 */
export interface NecessityTest {
  purposeSpecified: boolean;
  purposeJustification: string;
  adequacyAssessment: string;
  relevanceAssessment: string;
  minimizationMeasures: string[];
  alternativesConsidered: string[];
  endowmentConsultation: boolean;
  endowmentConsultationNotes?: string;
}

/**
 * Profit Reporting Compliance (Endowment Stakeholder)
 */
export interface ProfitReportingCompliance {
  applicable: boolean;
  endowmentDataUsed: boolean;
  corporateDataUsed: boolean;
  dataSeparation: boolean;
  separationMechanism?: string;
  profitAttribution: {
    endowmentPortion: number;
    corporatePortion: number;
    calculationMethod: string;
  };
  transparencyMeasures: string[];
  endowmentReviewDate?: string;
  endowmentApprovalStatus: ComplianceStatus;
  deviations: ComplianceDeviation[];
}

export interface ComplianceDeviation {
  id: string;
  rule: string;
  deviation: string;
  justification: string;
  compensatingControls: string[];
  approvedBy?: string;
  approvalDate?: string;
}

/**
 * DPO Rules and Policies
 */
export interface ComplianceRule {
  id: string;
  category: 'gdpr' | 'endowment-policy' | 'profit-reporting' | 'data-governance' | 'security';
  title: string;
  description: string;
  requirement: string;
  applicableDataCategories: DataCategory[];
  applicableStakeholders: StakeholderType[];
  mandatory: boolean;
  source: string;
  validationCriteria: ValidationCriteria[];
}

export interface ValidationCriteria {
  criterion: string;
  checkMethod: string;
  passThreshold: string;
}

/**
 * Data Inventory
 */
export interface DataInventoryItem {
  id: string;
  dataType: string;
  dataCategory: DataCategory;
  stakeholderOwner: StakeholderType;
  location: string;
  volume: string;
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  processingActivities: string[];
  retentionPeriod: string;
  disposalMethod: string;
  backupLocation?: string;
  encryptionStatus: boolean;
  accessControls: string[];
  lastAudit?: string;
}

/**
 * Compliance Report
 */
export interface ComplianceReport {
  id: string;
  reportType: 'dpia' | 'profit-reporting' | 'endowment-audit' | 'comprehensive';
  generatedDate: string;
  period: {
    start: string;
    end: string;
  };
  stakeholder: StakeholderType;
  summary: {
    totalAssessments: number;
    compliantCount: number;
    nonCompliantCount: number;
    pendingReviewCount: number;
    criticalRisks: number;
  };
  findings: ReportFinding[];
  recommendations: string[];
  signedBy?: string;
  signedDate?: string;
}

export interface ReportFinding {
  id: string;
  severity: RiskLevel;
  category: string;
  finding: string;
  evidence: string;
  recommendation: string;
  deadline?: string;
}

/**
 * Endowment Guidelines
 */
export interface EndowmentGuideline {
  id: string;
  title: string;
  category: 'data-usage' | 'profit-reporting' | 'transparency' | 'governance';
  description: string;
  requirements: string[];
  prohibitions: string[];
  approvalProcess: string;
  reviewFrequency: string;
  contactPerson: string;
}
