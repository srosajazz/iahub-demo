from django.urls import path
from . import views

urlpatterns = [
    path('login', views.login_view, name='login'),
    path('auth/check', views.auth_check_view, name='auth_check'),
    path('logout', views.logout_view, name='logout'),
    path('due-items', views.due_items_view, name='due_items'),
    path('due-items/<str:pk>', views.due_item_detail_view, name='due_item_detail'),
    path('messages', views.messages_view, name='messages'),
    path('action-items', views.action_items_view, name='action_items'),
    path('action-items/<str:pk>/done', views.action_item_done_view, name='action_item_done'),
    path('donors', views.donors_view, name='donors'),
    path('donors/<str:pk>', views.donor_detail_view, name='donor_detail'),
]
