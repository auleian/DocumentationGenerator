import uuid
from django.db import models

# What this does is to track the session at any given point during document processing.
# If user is still answerin questions then we are in progress and when document is done generating, session will be generated.
#
class DocumentSession(models.Model):
    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('answers_complete', 'Answers Complete'),
        ('generating', 'Generating'),
        ('generated', 'Generated'),
        ('exported', 'Exported'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document_type = models.CharField(max_length=50, default='srs')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='in_progress')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)