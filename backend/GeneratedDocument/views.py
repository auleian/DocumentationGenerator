from rest_framework import viewsets
from .models import GeneratedDocument
from .serializers import GeneratedDocumentSerializer

class GeneratedDocumentViewSet(viewsets.ModelViewSet):
    queryset = GeneratedDocument.objects.all()
    serializer_class = GeneratedDocumentSerializer