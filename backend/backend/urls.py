# backend/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from todo.views import TodoView, diss_user

router = routers.DefaultRouter()
router.register(r'tasks', TodoView, basename='task')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/diss/', diss_user, name='diss_user'),
]