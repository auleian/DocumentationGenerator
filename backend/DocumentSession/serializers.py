from rest_framework import serializers  
from .models import DocumentSession

class DocumentSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentSession
        fields = ['id', 'document_type', 'status', 'created_at', 'expires_at']
        read_only_fields = ['id', 'status', 'created_at']