from django.core.management.base import BaseCommand
from DocumentType.models import DocumentType
from Sections.models import Section

SECTIONS = [
    # Section 1: Introduction
    ("1",     "Introduction",                              1, None),
    ("1.1",   "Document Purpose",                          1, "1"),
    ("1.2",   "Product Scope",                             2, "1"),
    ("1.3",   "Definitions, Acronyms, and Abbreviations",  3, "1"),
    ("1.4",   "References",                                4, "1"),
 
    # Section 2: Product Overview
    ("2",     "Product Overview",                          2, None),
    ("2.1",   "Product Perspective",                       1, "2"),
    ("2.2",   "Product Functions",                          2, "2"),
    ("2.3",   "Product Constraints",                        3, "2"),
    ("2.4",   "User Characteristics",                       4, "2"),
    ("2.5",   "Assumptions and Dependencies",               5, "2"),
    ("2.6",   "Apportioning of Requirements",                6, "2"),
 
    # Section 3: Requirements
    ("3",     "Requirements",                                3, None),
    ("3.1",   "External Interfaces",                          1, "3"),
    ("3.1.1", "User Interfaces",                               1, "3.1"),
    ("3.1.2", "Hardware Interfaces",                            2, "3.1"),
    ("3.1.3", "Software Interfaces",                            3, "3.1"),
    ("3.2",   "Functional",                                       2, "3"),
    ("3.3",   "Quality of Service",                                3, "3"),
    ("3.3.1", "Performance",                                        1, "3.3"),
    ("3.3.2", "Security",                                            2, "3.3"),
    ("3.3.3", "Reliability",                                          3, "3.3"),
    ("3.3.4", "Availability",                                          4, "3.3"),
    ("3.3.5", "Observability",                                          5, "3.3"),
    ("3.4",   "Compliance",                                              4, "3"),
    ("3.5",   "Design and Implementation",                                5, "3"),
    ("3.5.1", "Installation",                                             1, "3.5"),
    ("3.5.6", "Portability",                                               2, "3.5"),
    ("3.5.7", "Cost",                                                       3, "3.5"),
    ("3.5.8", "Deadline",                                                    4, "3.5"),
    ("3.6",   "AI/ML",                                                       6, "3"),
    ("3.6.1", "Model Specification",                                         1, "3.6"),
    ("3.6.2", "Data Management",                                              2, "3.6"),
    ("3.6.3", "Guardrails",                                                    3, "3.6"),
    ("3.6.5", "Human-in-the-Loop",                                            4, "3.6"),
 
    # Section 4: Verification
    ("4",     "Verification",                                                4, None),
]

class Command(BaseCommand):
    help = "seed the sections table"

    def handle(self, *args, **options):
        srs = DocumentType.objects.get(name="srs")
        section_lookup = {}

        for number, name, order, parent_number in SECTIONS:
            parent = section_lookup.get(parent_number) if parent_number else None
            section, created = Section.objects.get_or_create(
                number=number,
                document_type=srs,
                defaults={"name": name, "order": order, "parent": parent},
            )
            section_lookup[number] = section
            if created:
                self.stdout.write(f"  Section {number} — {name} created")
 
        self.stdout.write(self.style.SUCCESS(f"Seeded {len(SECTIONS)} sections."))