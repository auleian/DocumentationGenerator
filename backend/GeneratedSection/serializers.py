from rest_framework import serializers
from .models import GeneratedSection

class GeneratedSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneratedSection
        fields = [
            'id', 'session', 'section', 'content', 'diagram_data_url', 'diagram_file_name',
            'status', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'diagram_data_url', 'diagram_file_name', 'status', 'created_at', 'updated_at']