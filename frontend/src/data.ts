import type { Draft, SrsSection } from './types';

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

// IEEE 830 SRS structure
export const SECTIONS: SrsSection[] = [
  {
    id: '1',
    title: 'Introduction',
    description: 'Purpose, scope, and intended audience for this specification.',
    questions: [
      {
        id: 's1_purpose',
        label: 'What is the purpose of this SRS?',
        docTitle: 'Purpose',
        type: 'textarea',
        placeholder:
          'e.g. This SRS defines the functional and non-functional requirements for the AIBOS Energy Management System…',
        help: 'State the problem this document aims to solve and its overall intent.',
      },
      {
        id: 's1_scope',
        label: 'What is the scope of the system?',
        docTitle: 'Scope',
        type: 'textarea',
        placeholder: 'e.g. The system covers metering, analytics, and reporting for industrial sites…',
        help: 'Include what is in scope and, where helpful, what is explicitly out of scope.',
      },
      {
        id: 's1_audience',
        label: 'Who is the intended audience?',
        docTitle: 'Intended audience',
        type: 'text',
        placeholder: 'e.g. Engineering, QA, Product, Compliance',
      },
      {
        id: 's1_glossary',
        label: 'Are there domain terms to define up front?',
        docTitle: 'Definitions and acronyms',
        type: 'select',
        options: ['Yes — included in Appendix A', 'No — terms defined inline', 'Not yet determined'],
      },
    ],
  },
  {
    id: '2',
    title: 'Overall description',
    description: 'System context, user characteristics, constraints, and assumptions.',
    questions: [
      {
        id: 's2_context',
        label: 'What is the system context?',
        docTitle: 'Product perspective',
        type: 'textarea',
        placeholder: 'e.g. AIBOS EMS sits between on-site meters and the cloud analytics platform…',
      },
      {
        id: 's2_users',
        label: 'Who are the primary user classes?',
        docTitle: 'User classes',
        type: 'text',
        placeholder: 'e.g. Site operators, Energy analysts, Admins',
      },
      {
        id: 's2_constraints',
        label: 'What constraints apply?',
        docTitle: 'Constraints',
        type: 'textarea',
        placeholder: 'e.g. Must run on-prem; data residency in EU; max 5s polling interval…',
      },
      {
        id: 's2_assumptions',
        label: 'What assumptions are being made?',
        docTitle: 'Assumptions and dependencies',
        type: 'textarea',
        placeholder: 'e.g. Meters expose a Modbus TCP interface; network is reliable…',
      },
    ],
    diagram: {
      type: 'System context diagram',
      reason: 'Shows the system boundary and external actors that interact with AIBOS EMS.',
    },
  },
  {
    id: '3.1',
    title: 'Functional requirements',
    description: 'Core capabilities and user actions the system must provide.',
    questions: [
      {
        id: 's31_actions',
        label: 'What are the core actions a user can take in this system?',
        docTitle: 'Core use cases',
        type: 'textarea',
        placeholder: 'e.g. View live meter readings, configure thresholds, export reports…',
        help: 'List the primary use cases — one per line is fine.',
      },
      {
        id: 's31_roles',
        label: 'Are there different user roles with different permissions?',
        docTitle: 'Access control',
        type: 'select',
        options: [
          'Yes — role-based access (Admin, Operator, Viewer)',
          'Yes — two tiers (Admin, User)',
          'No — single role for all users',
        ],
      },
      {
        id: 's31_workflows',
        label: 'Describe the key workflows end-to-end.',
        docTitle: 'Key workflows',
        type: 'textarea',
        placeholder: 'e.g. Onboarding a new site → assigning meters → setting baselines → alerts…',
      },
      {
        id: 's31_data_flow',
        label: 'How does data flow through the system?',
        docTitle: 'Data flow',
        type: 'text',
        placeholder: 'e.g. Meter → Edge gateway → Ingest service → Time-series DB → UI',
      },
    ],
    diagram: {
      type: 'Architecture diagram',
      reason: 'Shows how the three layers (edge, ingestion, presentation) connect.',
    },
  },
  {
    id: '3.2',
    title: 'Data requirements',
    description: 'Persistent data, formats, retention, and volume expectations.',
    questions: [
      {
        id: 's32_entities',
        label: 'What are the core data entities?',
        docTitle: 'Logical data model',
        type: 'textarea',
        placeholder: 'e.g. Site, Meter, Reading, Alert, User, Report',
      },
      {
        id: 's32_format',
        label: 'What data formats are produced or consumed?',
        docTitle: 'Data formats',
        type: 'select',
        options: ['JSON over HTTPS', 'CSV / Parquet exports', 'Modbus + MQTT', 'Mixed — see data dictionary'],
      },
      {
        id: 's32_retention',
        label: 'What are the retention and volume expectations?',
        docTitle: 'Retention and volume',
        type: 'text',
        placeholder: 'e.g. 2 years raw, 5 years aggregated; ~50GB/month',
      },
    ],
  },
  {
    id: '3.3',
    title: 'Interface requirements',
    description: 'External integrations, UI constraints, and protocol expectations.',
    questions: [
      {
        id: 's33_apis',
        label: 'Which external APIs or integrations are required?',
        docTitle: 'External interfaces',
        type: 'textarea',
        placeholder: 'e.g. SCADA historian, SCIM identity provider, SMTP for alerts…',
      },
      {
        id: 's33_ui',
        label: 'What UI constraints apply?',
        docTitle: 'User interface constraints',
        type: 'text',
        placeholder: 'e.g. Responsive web; WCAG 2.1 AA; dark mode optional',
      },
      {
        id: 's33_protocol',
        label: 'Which protocols must be supported?',
        docTitle: 'Communication protocols',
        type: 'select',
        options: ['HTTPS / REST', 'MQTT', 'Modbus TCP', 'OPC-UA'],
      },
    ],
  },
  {
    id: '3.4',
    title: 'Compliance',
    description: 'Regulatory, security, and audit requirements the system must satisfy.',
    questions: [
      {
        id: 's34_regulations',
        label: 'Which regulations or standards apply?',
        docTitle: 'Regulatory standards',
        type: 'text',
        placeholder: 'e.g. GDPR, ISO 27001, IEC 62443',
      },
      {
        id: 's34_security',
        label: 'What security controls are required?',
        docTitle: 'Security controls',
        type: 'textarea',
        placeholder: 'e.g. TLS 1.2+, SSO, audit logging, secrets rotation…',
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
];

export const MOCK_DRAFTS: Draft[] = [
  {
    id: 'draft-1',
    title: 'AIBOS EMS SRS',
    subtitle: 'Energy Management System — core platform',
    progress: 0.62,
    lastEdited: '2 days ago',
    answers: {
      s1_purpose:
        'This SRS defines the functional and non-functional requirements for the AIBOS Energy Management System, a platform for real-time metering, analytics, and reporting across industrial sites.',
      s1_scope:
        'In scope: meter ingestion, site hierarchy, alerting, and reporting. Out of scope: billing and customer-facing portals.',
      s1_audience: 'Engineering, QA, Product, Compliance',
      s1_glossary: 'Yes — included in Appendix A',
      s2_context:
        'AIBOS EMS sits between on-site meters and the cloud analytics platform, normalizing readings and surfacing anomalies.',
      s2_users: 'Site operators, Energy analysts, Admins',
      s2_constraints: 'Must run on-prem at edge; EU data residency; max 5s polling interval.',
      s31_actions: 'View live meter readings; configure thresholds; acknowledge alerts; export reports.',
      s31_roles: 'Yes — role-based access (Admin, Operator, Viewer)',
      s31_workflows:
        'Onboard site → assign meters → set baselines → configure alerts → review weekly report.',
      s31_data_flow: 'Meter → Edge gateway → Ingest service → Time-series DB → UI',
      s32_entities: 'Site, Meter, Reading, Alert, User, Report',
      s32_format: 'Modbus + MQTT',
      s32_retention: '2 years raw, 5 years aggregated; ~50GB/month',
      s33_apis: 'SCADA historian (read), SCIM identity provider, SMTP for alert delivery.',
      s33_ui: 'Responsive web; WCAG 2.1 AA; dark mode optional',
      s33_protocol: 'MQTT',
      s34_regulations: 'GDPR, ISO 27001',
      s34_security: 'TLS 1.2+, SSO via SAML, audit logging, 90-day secret rotation.',
      s34_audit: 'Yes — immutable, 1 year retention',
    },
    diagrams: {
      '2': { dataUrl: PLACEHOLDER_DIAGRAM, fileName: 'system-context.png' },
      '3.1': { dataUrl: PLACEHOLDER_DIAGRAM, fileName: 'architecture.png' },
    },
  },
  {
    id: 'draft-2',
    title: 'AIBOS Billing Service SRS',
    subtitle: 'Usage-based billing & invoicing',
    progress: 0.28,
    lastEdited: '5 hours ago',
    answers: {
      s1_purpose: 'Define requirements for the billing service that invoices customers based on metered usage.',
      s1_scope: 'In scope: rate plans, invoicing, payment reconciliation. Out of scope: metering itself.',
    },
    diagrams: {},
  },
  {
    id: 'draft-3',
    title: 'AIBOS Mobile Field App SRS',
    subtitle: 'Operator field inspections on tablet',
    progress: 0.85,
    lastEdited: 'yesterday',
    answers: {
      s1_purpose: 'Specify the tablet app used by operators for on-site inspections and meter readings.',
      s1_scope: 'Offline-first inspections, photo capture, sync-on-connect.',
      s1_audience: 'Engineering, QA, Field operations',
      s2_users: 'Site operators, Field supervisors',
    },
    diagrams: {},
  },
];
