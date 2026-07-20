import uuid
from django.db import models
from Sections.models import Section   # adjust import path to match your actual app name

class Question(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    text = models.TextField()                     
    section = models.ForeignKey(
        Section,
        related_name='questions',
        on_delete=models.CASCADE
    )
    order = models.PositiveIntegerField()          
    is_required = models.BooleanField(default=True)  
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.text[:50]
