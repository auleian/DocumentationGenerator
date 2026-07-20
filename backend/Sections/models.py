#This model is for setting up reusability for differentsections of different documents

import uuid
from django.db import models
from DocumentType.models import DocumentType   

class Section(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    number = models.CharField(max_length=20)          # e.g. "3", "3.3", "3.3.2"
    name = models.CharField(max_length=200)             # e.g. "Requirements", "Security"
    order = models.PositiveIntegerField()
    parent = models.ForeignKey(
        'self', null=True, blank=True,
        related_name='subsections',
        on_delete=models.CASCADE
    )
    document_type = models.ForeignKey(
        DocumentType,
        related_name='sections',
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.number} {self.name}"

