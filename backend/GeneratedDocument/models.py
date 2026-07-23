import uuid
from django.db import models
from DocumentSession.models import DocumentSession

class GeneratedDocument(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('assembling', 'Assembling'),
        ('ready', 'Ready'),
        ('failed', 'Failed'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.OneToOneField(DocumentSession, related_name='generated_document', on_delete=models.CASCADE)
    content = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Document for session {self.session_id}"