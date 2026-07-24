from rest_framework import viewsets
from .models import GeneratedSection
from .serializers import GeneratedSectionSerializer

class GeneratedSectionViewSet(viewsets.ModelViewSet):
    queryset = GeneratedSection.objects.all()
    serializer_class = GeneratedSectionSerializer