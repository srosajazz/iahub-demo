from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
import os

def serve_frontend(request):
    index_path = os.path.join(settings.BASE_DIR, 'client', 'dist', 'index.html')
    if os.path.exists(index_path):
        with open(index_path, 'r') as f:
            return HttpResponse(f.read(), content_type='text/html')
    return HttpResponse('Frontend not built. Run npm run build first.', status=404)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

urlpatterns += [
    re_path(r'^(?!api/).*$', serve_frontend, name='frontend'),
]
