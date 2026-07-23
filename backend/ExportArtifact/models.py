import uuid
from django.db import models
from GeneratedDocument.models import GeneratedDocument

class ExportArtifact(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('converting', 'Converting'),
        ('ready', 'Ready'),
        ('failed', 'Failed'),
    ]
    FORMAT_CHOICES = [
        ('md', 'Markdown'),
        ('html', 'HTML'),
        ('docx', 'Word Document'),
        ('pdf', 'PDF'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(GeneratedDocument, related_name='exports', on_delete=models.CASCADE)
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES)
    file = models.FileField(upload_to='exports/')
    content_hash = models.CharField(max_length=64)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('document', 'format')

    def __str__(self):
        return f"{self.document_id} — {self.format}"