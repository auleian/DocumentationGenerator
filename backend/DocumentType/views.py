from rest_framework import viewsets
from .models import DocumentType
from .serializers import DocumentTypeSerializer

class DocumentTypeViewSet(viewsets.ModelViewSet):
    queryset = DocumentType.objects.all()
    serializer_class = DocumentTypeSerializer
