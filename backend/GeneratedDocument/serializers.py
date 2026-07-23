from rest_framework import serializers
from .models import GeneratedDocument

class GeneratedDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneratedDocument
        fields = ['id', 'session', 'content', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'content', 'status', 'created_at', 'updated_at']