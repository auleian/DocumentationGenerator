from rest_framework import serializers
from .models import Section

class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ['id', 'number', 'name', 'order', 'parent', 'document_type', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']