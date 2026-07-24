import uuid
from django.db import models
from DocumentSession.models import DocumentSession
from Sections.models import Section

class GeneratedSection(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('polishing', 'Polishing'),
        ('ready', 'Ready'),
        ('failed', 'Failed'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(DocumentSession, related_name='generated_sections', on_delete=models.CASCADE)
    section = models.ForeignKey(Section, related_name='generated_sections', on_delete=models.CASCADE)
    content = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('session', 'section')

    def __str__(self):
        return f"{self.session_id} — {self.section.number}"