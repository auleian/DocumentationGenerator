from rest_framework import serializers
from .models import ExportArtifact

class ExportArtifactSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExportArtifact
        fields = ['id', 'document', 'format', 'file', 'content_hash', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'file', 'content_hash', 'status', 'created_at', 'updated_at']