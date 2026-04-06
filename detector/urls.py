from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('predict/', views.predict, name='predict'),
    path('patients/', views.patient_list, name='patient_list'),
    path('profile/', views.profile, name='profile'),
    path('account-settings/', views.account_settings, name='account_settings'),
    path('result/<int:patient_id>/', views.result, name='result'),
    path('patient/<int:patient_id>/edit/', views.patient_edit, name='patient_edit'),
    path('patient/<int:patient_id>/delete/', views.patient_delete, name='patient_delete'),
]
