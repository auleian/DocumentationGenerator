from django.core.management.base import BaseCommand
from Sections.models import Section
from Questions.models import Question

QUESTIONS = [
    ("What is this system, and who is the primary audience for this SRS "
     "(product, engineering, QA, security, ops)?", "1.1", 1, True),
    ("Are there related documents this SRS should reference (vision/scope doc, "
     "architecture doc, contracts)?", "1.1", 2, False),
 
    ("What is the product's name and current version/release?", "1.2", 1, True),
    ("In a few sentences, what is the product's primary purpose and key capabilities?",
     "1.2", 2, True),
    ("What is explicitly IN scope, and what is explicitly OUT of scope?", "1.2", 3, True),
    ("Is this SRS covering the whole system, or just part of a larger system? "
     "If part of a larger system, how does it fit in?", "1.2", 4, True),
 
    ("Are there any domain-specific terms, acronyms, or abbreviations someone "
     "reading this SRS would need defined?", "1.3", 1, False),
 
    ("Are there standards, contracts, UX style guides, or other documents this "
     "SRS should cite?", "1.4", 1, False),
 
    ("Is this a brand-new product, a replacement for something, or part of an "
     "existing product family?", "2.1", 1, True),
    ("What other systems does it depend on or integrate with (upstream/downstream)?",
     "2.1", 2, True),
 
    ("What are the major features/functions of the system? (list 5-10 at a high level)",
     "2.2", 1, True),
 
    ("Are there mandated technologies, platforms, regulatory obligations, or "
     "organizational policies that constrain the design?", "2.3", 1, True),
 
    ("Who are the different user types/roles (e.g. end-user, admin, external "
     "system)? What's their technical expertise and how do they use the system?",
     "2.4", 1, True),
 
    ("What assumptions is this project relying on (environment, third-party "
     "services, team support)? What happens if one of these assumptions is wrong?",
     "2.5", 1, False),
 
    ("Are requirements split across releases/phases, or is this a single "
     "release? If phased, which requirements belong to which phase?", "2.6", 1, False),
 
    ("Describe how users will interact with the system — key screens/flows, "
     "and any accessibility standards to follow (e.g. WCAG).", "3.1.1", 1, True),
 
    ("Does the system interact with any physical devices? If so, which, and "
     "what are the communication requirements?", "3.1.2", 1, False),
 
    ("What other systems/APIs does this integrate with? For each: what data "
     "is exchanged, and what protocol/format is used?", "3.1.3", 1, True),
 
    ("For each major function named earlier: what triggers it, what does it "
     "do step by step, and what's the expected output?", "3.2", 1, True),
    ("What are the important error conditions or edge cases for each function?",
     "3.2", 2, True),
 
    ("Are there specific response time, throughput, or load expectations?",
     "3.3.1", 1, False),
 
    ("What are the authentication/authorization requirements? How is sensitive "
     "data protected (in transit/at rest)?", "3.3.2", 1, True),
 
    ("Are there uptime, retry, or failover expectations?", "3.3.3", 1, False),
 
    ("What's the target availability (e.g. uptime %), and are there maintenance "
     "windows?", "3.3.4", 1, False),
 
    ("What needs to be logged/monitored in production?", "3.3.5", 1, False),
 
    ("Are there specific regulations, licensing terms, or audit/record-keeping "
     "requirements this system must meet?", "3.4", 1, False),
 
    ("What platforms/environments must this run on? Any special setup/"
     "configuration needs?", "3.5.1", 1, False),
 
    ("Does this need to run across multiple OSes, cloud providers, or "
     "environments?", "3.5.6", 1, False),
 
    ("Are there budget or cost-per-transaction constraints influencing design?",
     "3.5.7", 1, False),
 
    ("Are there key milestones or a target delivery date?", "3.5.8", 1, True),
 
    ("What is each model meant to do, and how will you measure if it's "
     "performing acceptably?", "3.6.1", 1, False),
 
    ("Where does training/validation data come from, and are there consent, "
     "privacy, or anonymization requirements?", "3.6.2", 1, False),
 
    ("What safeguards prevent the AI from producing harmful, unsafe, or "
     "out-of-bounds outputs?", "3.6.3", 1, False),
 
    ("Where is human review/approval required in the AI's decisions?",
     "3.6.5", 1, False),
 
    ("How will requirements be verified — testing, analysis, inspection, or "
     "demonstration?", "4", 1, False),
]


class Command(BaseCommand):
    help = "Seed the questions table"

    def handle(self, *args, **options):
        question_count = 0

        for text, section_number, order, is_required in QUESTIONS:
            try:
                section = Section.objects.get(number=section_number)
            except Section.DoesNotExist:
                self.stdout.write(self.style.WARNING(
                    f"  Skipped question — section '{section_number}' not found: {text[:50]}..."
                ))
                continue

            _, created = Question.objects.get_or_create(
                text=text,
                section=section,
                defaults={"order": order, "is_required": is_required},
            )
            if created:
                question_count += 1

        self.stdout.write(self.style.SUCCESS(f"Seeded {question_count} questions."))
        self.stdout.write(self.style.SUCCESS("Done."))