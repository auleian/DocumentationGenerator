from rest_framework.routers import DefaultRouter
from .views import GeneratedSectionViewSet

router = DefaultRouter()
router.register('generated-sections', GeneratedSectionViewSet, basename='generatedsection')
urlpatterns = router.urls