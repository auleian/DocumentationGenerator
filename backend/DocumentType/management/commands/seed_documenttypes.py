from django.core.management.base import BaseCommand
from DocumentType.models import DocumentType

DOCUMENT_TYPES = [
    #(name, display name)
    ("srs", "Software Requirement Specification"),
]

class Command(BaseCommand):
    help = "seed the document types table"

    def handle(self, *args, **options):
        for name, display_name in DOCUMENT_TYPES:
            obj, created = DocumentType.objects.get_or_create(
                name=name,
                defaults={"display_name": display_name},
            )
            status = "created" if created else "already existed"
            self.stdout.write(f"DocumentType '{name}' {status}.")

        self.stdout.write(self.style.SUCCESS(
            f"Done. {len(DOCUMENT_TYPES)} document type(s) processed."
        ))