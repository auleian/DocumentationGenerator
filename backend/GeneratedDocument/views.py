from rest_framework import viewsets
from .models import GeneratedDocument
from .serializers import GeneratedDocumentSerializer
from django.core.files.base import ContentFile
from rest_framework.decorators import action
from rest_framework.response import Response


class GeneratedDocumentViewSet(viewsets.ModelViewSet):
    queryset = GeneratedDocument.objects.all()
    serializer_class = GeneratedDocumentSerializer

    