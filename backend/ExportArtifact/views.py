from rest_framework import viewsets
from .models import ExportArtifact
from .serializers import ExportArtifactSerializer

class ExportArtifactViewSet(viewsets.ModelViewSet):
    queryset = ExportArtifact.objects.all()
    serializer_class = ExportArtifactSerializer