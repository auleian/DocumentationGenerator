from django.core.management.base import BaseCommand
from DocumentType.models import DocumentType
from Sections.models import Section

SECTIONS = [
    # Section 1: Introduction
    ("1",     "Introduction",                              1, None,
     "Briefly summarize the SRS's purpose, product scope, intended audience, "
     "and how the document is organized. Do not include details here; "
     "reference the relevant sections instead."),
    ("1.1",   "Document Purpose",                          1, "1",
     "State the purpose of the SRS in 2-4 sentences. Name the primary "
     "audiences (e.g., product, engineering, QA, security, compliance, "
     "operations) and how they use it across the software lifecycle."),
    ("1.2",   "Product Scope",                             2, "1",
     "Identify the product by name and version/release. In 3-5 sentences, "
     "describe its primary purpose, key capabilities, and intended outcomes. "
     "Clearly list inclusions and exclusions when this SRS covers part of a "
     "larger system. Focus on the 'what' and 'why.'"),
    ("1.3",   "Definitions, Acronyms, and Abbreviations",  3, "1",
     "Help readers understand specialized terms and notation by providing "
     "a glossary of domain terms, acronyms, and abbreviations used in the SRS."),
    ("1.4",   "References",                                4, "1",
     "Cite standards, contracts, policies, interface specs, UX style guides, "
     "use-case docs, architectural decisions, or a vision/scope document. "
     "For each reference, include title, author/owner, version, date, and "
     "location/URL. Indicate whether each reference is normative (binding) "
     "or informative (guidance)."),

    # Section 2: Product Overview
    ("2",     "Product Overview",                          2, None,
     "Provides background and context influencing the product's requirements."),
    ("2.1",   "Product Perspective",                       1, "2",
     "Describe context and origin of the product, whether this is a new "
     "product, replacement, or member of a family. If part of a larger "
     "system, briefly explain relationships, external interfaces, and key "
     "dependencies. Include details on ownership, service level agreements "
     "(SLAs), and support models."),
    ("2.2",   "Product Functions",                          2, "2",
     "Provide a concise overview of the major functional areas/features. "
     "Defer detailed behaviors, data, and edge cases to Section 3."),
    ("2.3",   "Product Constraints",                        3, "2",
     "Describe constraints such as mandated interfaces, technology stacks, "
     "regulatory obligations, QoS baselines, hardware limitations, AI/ML "
     "model families, and organizational policies."),
    ("2.4",   "User Characteristics",                       4, "2",
     "Identify user classes, roles, and personas, noting expertise, access "
     "levels, frequency of use, accessibility needs, and goals."),
    ("2.5",   "Assumptions and Dependencies",               5, "2",
     "List assumptions about environment, hardware, usage patterns, "
     "third-party components/services, and organizational support. List "
     "dependencies on external systems, libraries, or teams. For each, "
     "indicate potential impact if proven false."),
    ("2.6",   "Apportioning of Requirements",                6, "2",
     "Map major requirements to subsystems, services, or releases/iterations. "
     "Use a cross-reference table to show allocation and to clearly identify "
     "deferred requirements."),

    # Section 3: Requirements
    ("3",     "Requirements",                                3, None,
     "State requirements to a level of detail sufficient for design and "
     "verification. Use unique identifiers, consistent keywords "
     "(shall/should/may), and clear conditions. Describe inputs, processing "
     "in response, and outputs where applicable. Reference the relevant "
     "Product Constraints that the requirement addresses."),
    ("3.1",   "External Interfaces",                          1, "3",
     "Provide interface definitions sufficient for implementation and test."),
    ("3.1.1", "User Interfaces",                               1, "3.1",
     "Define UI elements, flows, and standards to be followed (style guides, "
     "accessibility guidelines). Include layout constraints, common controls "
     "(e.g., help, search), keyboard shortcuts, error/empty-state behavior, "
     "and localization. Keep visual designs in a separate UI specification "
     "and reference them."),
    ("3.1.2", "Hardware Interfaces",                            2, "3.1",
     "Specify (un)supported device types, data/control signals, electrical "
     "or mechanical characteristics if relevant, and communication "
     "protocols. Include timing, throughput, and reliability expectations."),
    ("3.1.3", "Software Interfaces",                            3, "3.1",
     "List connected systems (name and version), required or provided "
     "services/APIs, data items/messages exchanged, communication "
     "styles/protocols, and limit/error/timeout semantics. Identify shared "
     "data and ownership."),
    ("3.2",   "Functional",                                       2, "3",
     "Organize functional requirements by feature, use case, or service. "
     "For each, describe triggers/inputs, processing/logic (at a black-box "
     "level), outputs, and error conditions. For AI behaviors, define "
     "determinism bounds (e.g., temperature), refusal criteria, safety "
     "rules, and human review points."),
    ("3.3",   "Quality of Service",                                3, "3",
     "Use specific metrics, ranges, and conditions."),
    ("3.3.1", "Performance",                                        1, "3.3",
     "Specify timing relationships, peak/steady-state loads, and "
     "performance targets under expected conditions. Include measurement "
     "methods, environments, and acceptance thresholds. Note any real-time "
     "constraints."),
    ("3.3.2", "Security",                                            2, "3.3",
     "Define authentication, authorization, data protection (in transit/at "
     "rest), auditing, and privacy requirements. Address abuse/misuse and "
     "external attacks (e.g., injection, data exfiltration, or service "
     "compromise), and include secure defaults and incident response "
     "requirements."),
    ("3.3.3", "Reliability",                                          3, "3.3",
     "Specify reliability metrics and techniques (e.g., MTBF, error "
     "budgets, retry/backoff, idempotency, redundancy). Define conditions "
     "under which reliability is assessed and any failover behaviors. "
     "Define graceful degradation, timeout/abstain policies, and rollback "
     "to previous versions."),
    ("3.3.4", "Availability",                                          4, "3.3",
     "Define availability targets, maintenance windows, and mechanisms "
     "like checkpointing, recovery, and restart. Include geographical/zone "
     "redundancy if applicable."),
    ("3.3.5", "Observability",                                          5, "3.3",
     "Define requirements for logs, metrics, traces, and profiling: "
     "events/fields, cardinality limits, sampling, retention, and "
     "privacy/PII handling in telemetry. Specify standard labels, "
     "correlation/trace IDs propagation, and redaction policies. State "
     "SLO-aligned alert rules, dashboards, and ownership."),
    ("3.4",   "Compliance",                                              4, "3",
     "Specify mandated formats, naming conventions, accounting procedures, "
     "provider/user rights and agreements, licensing agreements, audit "
     "tracing, records retention, and reporting. For each compliance item, "
     "reference the relevant Product Constraints if applicable, or cite "
     "the authoritative source directly."),
    ("3.5",   "Design and Implementation",                                5, "3",
     "Constraints or mandates affecting how the solution is designed, "
     "deployed, and maintained."),
    ("3.5.1", "Installation",                                             1, "3.5",
     "Define (un)supported platforms/environments, prerequisites, "
     "installation methods, environment configuration (e.g., env vars, "
     "secrets), and rollback/uninstall procedures."),
    ("3.5.6", "Portability",                                               2, "3.5",
     "Specify (un)supported operating systems, hardware architectures, "
     "cloud providers, or container runtimes. Define abstraction layers, "
     "configuration policies, and externalization of environment-specific "
     "settings."),
    ("3.5.7", "Cost",                                                       3, "3.5",
     "State budgetary limits, cost-per-transaction targets, licensing "
     "constraints, or cloud spend envelopes that influence design "
     "decisions."),
    ("3.5.8", "Deadline",                                                    4, "3.5",
     "Specify key milestones, delivery dates, or phases/increments. "
     "Indicate dependencies between milestones and required readiness "
     "criteria."),
    ("3.6",   "AI/ML",                                                       6, "3",
     "This section defines requirements unique to systems incorporating "
     "machine learning or data-driven components at their core. These "
     "requirements complement functional, quality, and design aspects in "
     "preceding sections but address ML-specific lifecycle, data, and "
     "ethical considerations."),
    ("3.6.1", "Model Specification",                                         1, "3.6",
     "Describe model(s) purpose, scope, expected behavior, key inputs and "
     "outputs, and measurable performance objectives. Note any validation "
     "datasets, benchmarks, or versioning practices used to ensure "
     "reproducibility."),
    ("3.6.2", "Data Management",                                              2, "3.6",
     "Specify dataset origin, ownership, consent conditions; labeling "
     "processes and quality controls; data lineage, versioning, and "
     "reproducibility (training -> validation -> inference); storage, "
     "access controls, and anonymization/pseudonymization standards; "
     "handling of missing, synthetic, or augmented data."),
    ("3.6.3", "Guardrails",                                                    3, "3.6",
     "Specify how the system validates inputs, filters or constrains "
     "outputs, and limits available actions to prevent harm, misuse, or "
     "unintended consequences. Include mechanisms to detect and respond to "
     "malicious inputs or unsafe operational conditions."),
    ("3.6.5", "Human-in-the-Loop",                                            4, "3.6",
     "Describe where and how human review, approval, or intervention is "
     "required. Clarify review latency or throughput expectations, "
     "escalation paths, feedback mechanisms, traceability, and "
     "auditability of human actions."),

    # Section 4: Verification
    ("4",     "Verification",                                                4, None,
     "Outline verification methods (test, canary metrics, analysis, "
     "inspection, demonstration) and test evidence preferably in a matrix "
     "paralleling the Requirements section. Consider adding environment "
     "details, tools, and test data requirements."),
]

class Command(BaseCommand):
    help = "seed the sections table"

    def handle(self, *args, **options):
        srs = DocumentType.objects.get(name="srs")
        section_lookup = {}

        for number, name, order, parent_number, template_instructions in SECTIONS:
            parent = section_lookup.get(parent_number) if parent_number else None
            section, created = Section.objects.update_or_create(
                number=number,
                document_type=srs,
                defaults={
                    "name": name,
                    "order": order,
                    "parent": parent,
                    "template_instructions": template_instructions,
                },
            )
            section_lookup[number] = section
            if created:
                self.stdout.write(f"  Section {number} — {name} created")
            else:
                self.stdout.write(f"  Section {number} — {name} updated")

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(SECTIONS)} sections."))
