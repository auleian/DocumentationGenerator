from rest_framework import viewsets
from .models import DocumentSession
from .serializers import DocumentSessionSerializer

class DocumentSessionViewSet(viewsets.ModelViewSet):
    queryset = DocumentSession.objects.all()
    serializer_class = DocumentSessionSerializer


