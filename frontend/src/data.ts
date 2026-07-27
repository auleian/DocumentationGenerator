import type { Draft, SrsSection, Template } from './types';

// A tiny placeholder image so mock drafts render a real "attached" diagram.
const PLACEHOLDER_DIAGRAM =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="240">' +
      '<rect width="100%" height="100%" fill="#f0fdf4"/>' +
      '<rect x="1" y="1" width="478" height="238" fill="none" stroke="#bbf7d0" stroke-width="2"/>' +
      '<text x="50%" y="50%" font-family="sans-serif" font-size="16" fill="#16a34a" text-anchor="middle">Sample diagram</text>' +
      '</svg>',
  );

/**
 * The SRS house-style skeleton: generic across projects, adapted from the
 * reference SRS's own structure. Universal categories (Quality of Service's
 * five subsections) are fixed; project-specific content ("Functional
 * Requirements") is a single guided section where the author describes their
 * own capabilities in their own words — the generation step organizes that
 * into the numbered, shall/should/may house style, it isn't hardcoded here.
 *
 * Every section is independently selectable in the section picker except
 * where noted; all default to selected.
 */
export const SRS_SECTIONS: SrsSection[] = [
  // 1. Introduction
  {
    id: '1.1',
    title: 'Document Purpose',
    topGroup: '1. Introduction',
    description: 'Why this document exists and who it is for.',
    questions: [
      {
        id: 's1_1_purpose',
        label: 'What is the purpose of this document?',
        docTitle: 'Purpose',
        type: 'textarea',
        placeholder: 'e.g. This SRS defines the requirements for the AIBOS Energy Management System…',
        help: 'Who is it for, and what will they use it to do?',
      },
    ],
  },
  {
    id: '1.2',
    title: 'Product Scope',
    topGroup: '1. Introduction',
    description: 'What the product is, and what this release covers.',
    questions: [
      {
        id: 's1_2_summary',
        label: 'In a sentence or two, what does the product do?',
        docTitle: 'Product summary',
        type: 'textarea',
      },
      {
        id: 's1_2_in_scope',
        label: 'What is in scope for this release?',
        docTitle: 'In scope',
        type: 'textarea',
      },
      {
        id: 's1_2_out_scope',
        label: 'What is explicitly out of scope?',
        docTitle: 'Out of scope',
        type: 'textarea',
      },
    ],
  },
  {
    id: '1.3',
    title: 'Definitions, Acronyms, and Abbreviations',
    topGroup: '1. Introduction',
    description: 'Domain terms a reader will need.',
    questions: [
      {
        id: 's1_3_terms',
        label: 'List any terms, acronyms, or abbreviations a reader will need, with a short definition each.',
        docTitle: 'Definitions and acronyms',
        type: 'textarea',
        placeholder: 'e.g. EMS — Energy Management System; SCADA — Supervisory Control and Data Acquisition',
      },
    ],
  },
  {
    id: '1.4',
    title: 'References',
    topGroup: '1. Introduction',
    description: 'Other documents this one depends on or points to.',
    questions: [
      {
        id: 's1_4_references',
        label: 'Are there other documents this one depends on or points to?',
        docTitle: 'References',
        type: 'textarea',
        placeholder: 'e.g. Vision & Roadmap doc, API spec, design system — leave blank if none',
      },
    ],
  },
  {
    id: '1.5',
    title: 'Document Overview',
    topGroup: '1. Introduction',
    description: 'How the rest of the document is organized.',
    questions: [
      {
        id: 's1_5_overview',
        label: "Briefly, how is the rest of this document organized?",
        docTitle: 'Document overview',
        type: 'textarea',
        help: 'This is usually boilerplate — a sentence or two is enough.',
      },
    ],
  },

  // 2. Product Overview
  {
    id: '2.1',
    title: 'Product Perspective',
    topGroup: '2. Product Overview',
    description: 'How this product fits into its wider environment.',
    questions: [
      {
        id: 's2_1_context',
        label: 'How does this product fit into its wider environment?',
        docTitle: 'Product perspective',
        type: 'textarea',
        placeholder: 'Is it standalone, or does it replace/extend something? What systems does it talk to?',
      },
      {
        id: 's2_1_dependencies',
        label: 'What external systems or services does it depend on?',
        docTitle: 'Dependencies',
        type: 'textarea',
      },
    ],
    diagram: {
      type: 'System Context Diagram',
      reason: 'Shows the system as a single box with its external actors and systems around it.',
    },
  },
  {
    id: '2.2',
    title: 'Product Functions',
    topGroup: '2. Product Overview',
    description: 'The major functions the product provides, at a summary level.',
    questions: [
      {
        id: 's2_2_functions',
        label: 'List the major functions the product provides, at a summary level.',
        docTitle: 'Product functions',
        type: 'textarea',
      },
    ],
  },
  {
    id: '2.3',
    title: 'Product Constraints',
    topGroup: '2. Product Overview',
    description: 'Constraints the design must honour.',
    questions: [
      {
        id: 's2_3_constraints',
        label: 'What constraints must the design honour?',
        docTitle: 'Constraints',
        type: 'textarea',
        placeholder: 'Regulatory, technical, organizational, or business constraints.',
      },
    ],
  },
  {
    id: '2.4',
    title: 'User Characteristics',
    topGroup: '2. Product Overview',
    description: 'The distinct classes of user and what they need.',
    questions: [
      {
        id: 's2_4_user_classes',
        label: 'Who are the distinct classes of user, and what do they need?',
        docTitle: 'User characteristics',
        type: 'textarea',
      },
    ],
  },
  {
    id: '2.5',
    title: 'Assumptions and Dependencies',
    topGroup: '2. Product Overview',
    description: "What you're assuming to be true.",
    questions: [
      {
        id: 's2_5_assumptions',
        label: 'What are you assuming to be true that, if false, would change this spec?',
        docTitle: 'Assumptions and dependencies',
        type: 'textarea',
      },
    ],
  },

  // 3.1 External Interfaces
  {
    id: '3.1.1',
    title: 'User Interfaces',
    topGroup: '3. Requirements',
    subGroup: '3.1 External Interfaces',
    description: 'Key user-interface requirements.',
    questions: [
      {
        id: 's311_ui',
        label: 'What are the key user-interface requirements?',
        docTitle: 'User interfaces',
        type: 'textarea',
        placeholder: 'e.g. Responsive web, WCAG 2.1 AA, dark mode optional',
      },
    ],
  },
  {
    id: '3.1.2',
    title: 'Software Interfaces',
    topGroup: '3. Requirements',
    subGroup: '3.1 External Interfaces',
    description: 'External APIs, services, or software interfaces required.',
    questions: [
      {
        id: 's312_software',
        label: 'Which external APIs, services, or software interfaces are required?',
        docTitle: 'Software interfaces',
        type: 'textarea',
      },
    ],
  },

  // 3.2 Functional Requirements
  {
    id: '3.2',
    title: 'Functional Requirements',
    topGroup: '3. Requirements',
    description: 'The core things a user can do with this system.',
    questions: [
      {
        id: 's32_actions',
        label: 'What are the core things a user can do with this system?',
        docTitle: 'Core capabilities',
        type: 'textarea',
        help: 'One per line is fine — these get organized into numbered requirements.',
      },
      {
        id: 's32_workflows',
        label: 'Describe the key workflows end-to-end.',
        docTitle: 'Key workflows',
        type: 'textarea',
      },
      {
        id: 's32_roles',
        label: 'Are there different user roles with different permissions?',
        docTitle: 'Access control',
        type: 'select',
        options: [
          'Yes — role-based access (Admin, Operator, Viewer)',
          'Yes — two tiers (Admin, User)',
          'No — single role for all users',
        ],
      },
    ],
    diagram: {
      type: 'Workflow / Architecture Diagram',
      reason: 'Shows how the main components and user flows connect.',
    },
  },

  // 3.3 Quality of Service
  {
    id: '3.3.1',
    title: 'Performance',
    topGroup: '3. Requirements',
    subGroup: '3.3 Quality of Service',
    description: 'Performance targets the system must meet.',
    questions: [
      {
        id: 's331_perf',
        label: 'What performance targets must the system meet?',
        docTitle: 'Performance',
        type: 'textarea',
        placeholder: 'e.g. response time, throughput, concurrent users',
      },
    ],
  },
  {
    id: '3.3.2',
    title: 'Security',
    topGroup: '3. Requirements',
    subGroup: '3.3 Quality of Service',
    description: 'Security requirements that apply.',
    questions: [
      {
        id: 's332_security',
        label: 'What security requirements apply?',
        docTitle: 'Security',
        type: 'textarea',
        placeholder: 'e.g. auth method, encryption, access control',
      },
    ],
  },
  {
    id: '3.3.3',
    title: 'Reliability',
    topGroup: '3. Requirements',
    subGroup: '3.3 Quality of Service',
    description: 'Reliability expectations.',
    questions: [
      {
        id: 's333_reliability',
        label: 'What reliability expectations apply?',
        docTitle: 'Reliability',
        type: 'textarea',
        placeholder: 'e.g. error handling, retry behaviour, data integrity',
      },
    ],
  },
  {
    id: '3.3.4',
    title: 'Availability',
    topGroup: '3. Requirements',
    subGroup: '3.3 Quality of Service',
    description: 'Uptime or availability target.',
    questions: [
      {
        id: 's334_availability',
        label: 'What uptime or availability target applies?',
        docTitle: 'Availability',
        type: 'text',
        placeholder: 'e.g. 99.5% monthly, with defined maintenance windows',
      },
    ],
  },
  {
    id: '3.3.5',
    title: 'Observability',
    topGroup: '3. Requirements',
    subGroup: '3.3 Quality of Service',
    description: "How the system's health will be monitored.",
    questions: [
      {
        id: 's335_observability',
        label: "How will the system's health be monitored?",
        docTitle: 'Observability',
        type: 'textarea',
        placeholder: 'e.g. logs, metrics, alerting on key failures',
      },
    ],
  },

  // 3.4 Compliance
  {
    id: '3.4',
    title: 'Compliance',
    topGroup: '3. Requirements',
    description: 'Regulatory or standards obligations.',
    questions: [
      {
        id: 's34_regulations',
        label: 'Which regulations or standards apply?',
        docTitle: 'Regulatory standards',
        type: 'text',
        placeholder: 'e.g. GDPR, ISO 27001, IEC 62443',
      },
      {
        id: 's34_audit',
        label: 'Is audit logging required?',
        docTitle: 'Audit logging',
        type: 'select',
        options: ['Yes — immutable, 1 year retention', 'Yes — standard logging', 'No'],
      },
    ],
  },

  // 3.5 Design and Implementation
  {
    id: '3.5',
    title: 'Design and Implementation',
    topGroup: '3. Requirements',
    description: 'Mandated stack or implementation constraints.',
    questions: [
      {
        id: 's35_stack',
        label: 'Is there a mandated technology stack or platform?',
        docTitle: 'Technology stack',
        type: 'textarea',
      },
      {
        id: 's35_constraints',
        label: 'Any implementation constraints worth recording?',
        docTitle: 'Implementation constraints',
        type: 'textarea',
        help: 'Optional — leave blank if none.',
      },
    ],
  },

  // 3.6 AI/ML — optional, only relevant when the project has AI/ML components
  {
    id: '3.6',
    title: 'AI/ML',
    topGroup: '3. Requirements',
    description: 'Only relevant if the project has AI/ML components.',
    optional: true,
    questions: [
      {
        id: 's36_model_use',
        label: 'What does the system use AI/ML for?',
        docTitle: 'Model use',
        type: 'textarea',
      },
      {
        id: 's36_guardrails',
        label: 'What guardrails apply to model output (human review, confidence thresholds, etc.)?',
        docTitle: 'Guardrails',
        type: 'textarea',
      },
    ],
  },

  // 4. Verification
  {
    id: '4',
    title: 'Verification',
    topGroup: '4. Verification',
    description: 'How requirements in this document will be verified.',
    questions: [
      {
        id: 's4_approach',
        label: 'How will requirements in this document be verified?',
        docTitle: 'Verification approach',
        type: 'textarea',
        placeholder: 'e.g. test, inspection, demonstration, analysis',
      },
      {
        id: 's4_acceptance',
        label: 'What are the top-level acceptance criteria for this release?',
        docTitle: 'Acceptance criteria',
        type: 'textarea',
      },
    ],
  },
];

export const TEMPLATES: Template[] = [
  {
    id: 'srs',
    name: 'Software Requirements Specification',
    description: 'Define what a system must do, in AIBOS house style — adapted from IEEE 830.',
    sections: SRS_SECTIONS,
  },
  {
    id: 'design-doc',
    name: 'Design Document',
    description: 'Architecture and design rationale for a system already scoped by an SRS.',
    sections: [],
    comingSoon: true,
  },
  {
    id: 'runbook',
    name: 'Runbook',
    description: 'Operational procedures for running and recovering a live system.',
    sections: [],
    comingSoon: true,
  },
];

/** All section IDs, used to default a new draft to "everything selected". */
export const ALL_SRS_SECTION_IDS = SRS_SECTIONS.map((s) => s.id);

// Existing screens (Wizard, Review, Dashboard, helpers, markdown) still import
// `SECTIONS` directly assuming the single SRS template; kept as an alias so
// they compile unchanged until they're adapted to read from a draft's own
// template/selection in a later step.
export const SECTIONS = SRS_SECTIONS;

export const MOCK_DRAFTS: Draft[] = [
  {
    id: 'draft-1',
    title: 'AIBOS EMS SRS',
    subtitle: 'Energy Management System — core platform',
    progress: 0.62,
    lastEdited: '2 days ago',
    templateId: 'srs',
    selectedSectionIds: ALL_SRS_SECTION_IDS,
    answers: {
      s1_1_purpose:
        'This SRS defines the functional and non-functional requirements for the AIBOS Energy Management System, a platform for real-time metering, analytics, and reporting across industrial sites.',
      s1_2_summary: 'A platform for real-time metering, analytics, and reporting across industrial sites.',
      s1_2_in_scope: 'Meter ingestion, site hierarchy, alerting, and reporting.',
      s1_2_out_scope: 'Billing and customer-facing portals.',
      s2_1_context:
        'AIBOS EMS sits between on-site meters and the cloud analytics platform, normalizing readings and surfacing anomalies.',
      s2_4_user_classes: 'Site operators, Energy analysts, Admins.',
      s2_3_constraints: 'Must run on-prem at edge; EU data residency; max 5s polling interval.',
      s32_actions: 'View live meter readings; configure thresholds; acknowledge alerts; export reports.',
      s32_roles: 'Yes — role-based access (Admin, Operator, Viewer)',
      s32_workflows:
        'Onboard site → assign meters → set baselines → configure alerts → review weekly report.',
      s312_software: 'SCADA historian (read), SCIM identity provider, SMTP for alert delivery.',
      s311_ui: 'Responsive web; WCAG 2.1 AA; dark mode optional.',
      s34_regulations: 'GDPR, ISO 27001',
      s332_security: 'TLS 1.2+, SSO via SAML, audit logging, 90-day secret rotation.',
      s34_audit: 'Yes — immutable, 1 year retention',
    },
    diagrams: {
      '2.1': { dataUrl: PLACEHOLDER_DIAGRAM, fileName: 'system-context.png' },
      '3.2': { dataUrl: PLACEHOLDER_DIAGRAM, fileName: 'architecture.png' },
    },
    generated: {},
    generationStatus: 'idle',
  },
  {
    id: 'draft-2',
    title: 'AIBOS Billing Service SRS',
    subtitle: 'Usage-based billing & invoicing',
    progress: 0.28,
    lastEdited: '5 hours ago',
    templateId: 'srs',
    selectedSectionIds: ALL_SRS_SECTION_IDS.filter((id) => id !== '3.6'),
    answers: {
      s1_1_purpose: 'Define requirements for the billing service that invoices customers based on metered usage.',
      s1_2_in_scope: 'Rate plans, invoicing, payment reconciliation.',
      s1_2_out_scope: 'Metering itself.',
    },
    diagrams: {},
    generated: {},
    generationStatus: 'idle',
  },
  {
    id: 'draft-3',
    title: 'AIBOS Mobile Field App SRS',
    subtitle: 'Operator field inspections on tablet',
    progress: 0.85,
    lastEdited: 'yesterday',
    templateId: 'srs',
    selectedSectionIds: ALL_SRS_SECTION_IDS.filter((id) => id !== '3.6'),
    answers: {
      s1_1_purpose: 'Specify the tablet app used by operators for on-site inspections and meter readings.',
      s1_2_in_scope: 'Offline-first inspections, photo capture, sync-on-connect.',
      s2_4_user_classes: 'Site operators, Field supervisors.',
    },
    diagrams: {},
    generated: {},
    generationStatus: 'idle',
  },
];
