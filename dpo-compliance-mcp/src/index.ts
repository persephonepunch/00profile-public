#!/usr/bin/env node

/**
 * DPO Compliance MCP Server
 * Provides tools for DPIA management, compliance checking, and reporting
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { dataStore } from './data-store.js';
import { validator } from './validator.js';
import { reportGenerator } from './report-generator.js';
import type { DPIAAssessment, DataInventoryItem, ComplianceRule, EndowmentGuideline } from './types.js';

const SERVER_NAME = 'dpo-compliance-mcp';
const SERVER_VERSION = '1.0.0';

class DPOComplianceServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: SERVER_NAME,
        version: SERVER_VERSION,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) =>
      this.handleToolCall(request)
    );
  }

  private getTools(): Tool[] {
    return [
      {
        name: 'create_dpia',
        description: 'Create a new DPIA (Data Protection Impact Assessment)',
        inputSchema: {
          type: 'object',
          properties: {
            assessment: {
              type: 'object',
              description: 'DPIA assessment data',
            },
          },
          required: ['assessment'],
        },
      },
      {
        name: 'get_dpia',
        description: 'Retrieve a DPIA assessment by ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'DPIA assessment ID',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'list_dpias',
        description: 'List all DPIA assessments',
        inputSchema: {
          type: 'object',
          properties: {
            dataCategory: {
              type: 'string',
              enum: ['endowment', 'corporate', 'mixed'],
              description: 'Filter by data category (optional)',
            },
          },
        },
      },
      {
        name: 'validate_dpia',
        description: 'Validate a DPIA assessment against compliance rules',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'DPIA assessment ID to validate',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'list_rules',
        description: 'List compliance rules',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              enum: ['gdpr', 'endowment-policy', 'profit-reporting', 'data-governance', 'security'],
              description: 'Filter by rule category (optional)',
            },
          },
        },
      },
      {
        name: 'get_rule',
        description: 'Get details of a specific compliance rule',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Rule ID',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'add_data_inventory',
        description: 'Add an item to the data inventory (track Endowment vs Corporate data)',
        inputSchema: {
          type: 'object',
          properties: {
            item: {
              type: 'object',
              description: 'Data inventory item',
            },
          },
          required: ['item'],
        },
      },
      {
        name: 'list_data_inventory',
        description: 'List data inventory items',
        inputSchema: {
          type: 'object',
          properties: {
            dataCategory: {
              type: 'string',
              enum: ['endowment', 'corporate', 'mixed'],
              description: 'Filter by data category (optional)',
            },
          },
        },
      },
      {
        name: 'generate_dpia_report',
        description: 'Generate a comprehensive DPIA report',
        inputSchema: {
          type: 'object',
          properties: {
            assessmentId: {
              type: 'string',
              description: 'DPIA assessment ID',
            },
          },
          required: ['assessmentId'],
        },
      },
      {
        name: 'generate_compliance_report',
        description: 'Generate a compliance report for a time period',
        inputSchema: {
          type: 'object',
          properties: {
            reportType: {
              type: 'string',
              enum: ['dpia', 'profit-reporting', 'endowment-audit', 'comprehensive'],
              description: 'Type of compliance report',
            },
            startDate: {
              type: 'string',
              description: 'Start date (ISO format)',
            },
            endDate: {
              type: 'string',
              description: 'End date (ISO format)',
            },
            stakeholder: {
              type: 'string',
              enum: ['endowment', 'corporate', 'third-party'],
              description: 'Filter by stakeholder (optional)',
            },
          },
          required: ['reportType', 'startDate', 'endDate'],
        },
      },
      {
        name: 'list_endowment_guidelines',
        description: 'List Endowment Stakeholder guidelines',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              enum: ['data-usage', 'profit-reporting', 'transparency', 'governance'],
              description: 'Filter by guideline category (optional)',
            },
          },
        },
      },
      {
        name: 'get_endowment_guideline',
        description: 'Get details of a specific Endowment Stakeholder guideline',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Guideline ID',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'check_profit_reporting_compliance',
        description: 'Check if DPIA meets profit reporting guidelines for Endowment Stakeholder',
        inputSchema: {
          type: 'object',
          properties: {
            assessmentId: {
              type: 'string',
              description: 'DPIA assessment ID',
            },
          },
          required: ['assessmentId'],
        },
      },
    ];
  }

  private async handleToolCall(request: any) {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'create_dpia':
          return await this.handleCreateDPIA(args);
        case 'get_dpia':
          return await this.handleGetDPIA(args);
        case 'list_dpias':
          return await this.handleListDPIAs(args);
        case 'validate_dpia':
          return await this.handleValidateDPIA(args);
        case 'list_rules':
          return await this.handleListRules(args);
        case 'get_rule':
          return await this.handleGetRule(args);
        case 'add_data_inventory':
          return await this.handleAddDataInventory(args);
        case 'list_data_inventory':
          return await this.handleListDataInventory(args);
        case 'generate_dpia_report':
          return await this.handleGenerateDPIAReport(args);
        case 'generate_compliance_report':
          return await this.handleGenerateComplianceReport(args);
        case 'list_endowment_guidelines':
          return await this.handleListEndowmentGuidelines(args);
        case 'get_endowment_guideline':
          return await this.handleGetEndowmentGuideline(args);
        case 'check_profit_reporting_compliance':
          return await this.handleCheckProfitReportingCompliance(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async handleCreateDPIA(args: any) {
    const assessment = args.assessment as DPIAAssessment;
    dataStore.saveDPIA(assessment);

    return {
      content: [
        {
          type: 'text',
          text: `DPIA assessment created successfully.\nID: ${assessment.id}\nName: ${assessment.name}\nStatus: ${assessment.status}`,
        },
      ],
    };
  }

  private async handleGetDPIA(args: any) {
    const assessment = dataStore.getDPIA(args.id);

    if (!assessment) {
      throw new Error(`DPIA assessment not found: ${args.id}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(assessment, null, 2),
        },
      ],
    };
  }

  private async handleListDPIAs(args: any) {
    let assessments = dataStore.getAllDPIAs();

    if (args.dataCategory) {
      assessments = assessments.filter(a => a.dataCategory === args.dataCategory);
    }

    const summary = assessments.map(a => ({
      id: a.id,
      name: a.name,
      dataCategory: a.dataCategory,
      stakeholderType: a.stakeholderType,
      status: a.status,
      lastModified: a.lastModified,
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${assessments.length} DPIA assessment(s):\n\n${JSON.stringify(summary, null, 2)}`,
        },
      ],
    };
  }

  private async handleValidateDPIA(args: any) {
    const assessment = dataStore.getDPIA(args.id);

    if (!assessment) {
      throw new Error(`DPIA assessment not found: ${args.id}`);
    }

    const validation = validator.validateAssessment(assessment);

    return {
      content: [
        {
          type: 'text',
          text: `Validation Results:\n\n${validation.summary}\n\nDetailed Results:\n${JSON.stringify(validation, null, 2)}`,
        },
      ],
    };
  }

  private async handleListRules(args: any) {
    let rules = args.category
      ? dataStore.getRulesByCategory(args.category)
      : dataStore.getAllRules();

    const summary = rules.map(r => ({
      id: r.id,
      category: r.category,
      title: r.title,
      mandatory: r.mandatory,
      applicableDataCategories: r.applicableDataCategories,
      applicableStakeholders: r.applicableStakeholders,
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${rules.length} compliance rule(s):\n\n${JSON.stringify(summary, null, 2)}`,
        },
      ],
    };
  }

  private async handleGetRule(args: any) {
    const rule = dataStore.getRule(args.id);

    if (!rule) {
      throw new Error(`Rule not found: ${args.id}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(rule, null, 2),
        },
      ],
    };
  }

  private async handleAddDataInventory(args: any) {
    const item = args.item as DataInventoryItem;
    dataStore.addInventoryItem(item);

    return {
      content: [
        {
          type: 'text',
          text: `Data inventory item added successfully.\nID: ${item.id}\nType: ${item.dataType}\nCategory: ${item.dataCategory}\nStakeholder: ${item.stakeholderOwner}`,
        },
      ],
    };
  }

  private async handleListDataInventory(args: any) {
    let items = args.dataCategory
      ? dataStore.getInventoryByCategory(args.dataCategory)
      : dataStore.getAllInventory();

    const summary = items.map(i => ({
      id: i.id,
      dataType: i.dataType,
      dataCategory: i.dataCategory,
      stakeholderOwner: i.stakeholderOwner,
      location: i.location,
      classification: i.classification,
      encryptionStatus: i.encryptionStatus,
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${items.length} data inventory item(s):\n\n${JSON.stringify(summary, null, 2)}`,
        },
      ],
    };
  }

  private async handleGenerateDPIAReport(args: any) {
    const report = reportGenerator.generateDPIAReport(args.assessmentId);

    return {
      content: [
        {
          type: 'text',
          text: report,
        },
      ],
    };
  }

  private async handleGenerateComplianceReport(args: any) {
    const report = reportGenerator.generateComplianceReport(
      args.reportType,
      args.startDate,
      args.endDate,
      args.stakeholder
    );

    return {
      content: [
        {
          type: 'text',
          text: `Compliance Report Generated\n\nReport ID: ${report.id}\nType: ${report.reportType}\nGenerated: ${report.generatedDate}\n\nSummary:\n${JSON.stringify(report.summary, null, 2)}\n\nFindings: ${report.findings.length}\nRecommendations: ${report.recommendations.length}\n\nFull Report:\n${JSON.stringify(report, null, 2)}`,
        },
      ],
    };
  }

  private async handleListEndowmentGuidelines(args: any) {
    let guidelines = args.category
      ? dataStore.getGuidelinesByCategory(args.category)
      : dataStore.getAllGuidelines();

    const summary = guidelines.map(g => ({
      id: g.id,
      category: g.category,
      title: g.title,
      reviewFrequency: g.reviewFrequency,
      contactPerson: g.contactPerson,
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${guidelines.length} Endowment Stakeholder guideline(s):\n\n${JSON.stringify(summary, null, 2)}`,
        },
      ],
    };
  }

  private async handleGetEndowmentGuideline(args: any) {
    const guideline = dataStore.getGuideline(args.id);

    if (!guideline) {
      throw new Error(`Guideline not found: ${args.id}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(guideline, null, 2),
        },
      ],
    };
  }

  private async handleCheckProfitReportingCompliance(args: any) {
    const assessment = dataStore.getDPIA(args.assessmentId);

    if (!assessment) {
      throw new Error(`DPIA assessment not found: ${args.assessmentId}`);
    }

    const validation = validator.validateAssessment(assessment);
    const profitViolations = validation.violations.filter(v =>
      v.ruleId.startsWith('profit-')
    );

    const isCompliant = profitViolations.length === 0;
    const status = isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT';

    let report = `Profit Reporting Compliance Check\n`;
    report += `Assessment: ${assessment.name}\n`;
    report += `Status: ${status}\n\n`;

    if (assessment.profitReportingCompliance) {
      const prc = assessment.profitReportingCompliance;
      report += `Data Separation: ${prc.dataSeparation ? 'Yes' : 'No'}\n`;
      report += `Endowment Portion: ${prc.profitAttribution?.endowmentPortion || 0}%\n`;
      report += `Corporate Portion: ${prc.profitAttribution?.corporatePortion || 0}%\n`;
      report += `Approval Status: ${prc.endowmentApprovalStatus}\n\n`;
    }

    if (profitViolations.length > 0) {
      report += `Violations Found (${profitViolations.length}):\n`;
      profitViolations.forEach((v, i) => {
        report += `\n${i + 1}. [${v.severity.toUpperCase()}] ${v.description}\n`;
        report += `   Recommendation: ${v.recommendation}\n`;
      });
    } else {
      report += `No profit reporting violations found.\n`;
    }

    return {
      content: [
        {
          type: 'text',
          text: report,
        },
      ],
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('DPO Compliance MCP Server running on stdio');
  }
}

const server = new DPOComplianceServer();
server.run().catch(console.error);
