from rest_framework import serializers
from .models import Question

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'section', 'order', 'is_required', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']