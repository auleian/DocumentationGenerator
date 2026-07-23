from rest_framework.routers import DefaultRouter
from .views import ExportArtifactViewSet

router = DefaultRouter()
router.register('export-artifacts', ExportArtifactViewSet, basename='exportartifact')
urlpatterns = router.urls