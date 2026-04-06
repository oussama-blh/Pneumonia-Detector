import re
from datetime import date

from django.contrib import messages
from django.contrib.auth import get_user_model, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse

from .models import Patient, UserProfile
from .utils import predict_pneumonia

@login_required
def dashboard(request):
    """Render the dashboard with patient statistics."""
    total_patients = Patient.objects.count()
    normal_count = Patient.objects.filter(prediction__icontains='Normal').count()
    pneumonia_count = Patient.objects.filter(prediction__icontains='Pneumonia').count()
    recent_patients = Patient.objects.order_by('-created_at')[:5]

    normal_rate = round((normal_count / total_patients) * 100, 1) if total_patients else 0
    pneumonia_rate = round((pneumonia_count / total_patients) * 100, 1) if total_patients else 0
    average_confidence = round(
        sum(patient.confidence_score for patient in recent_patients) / len(recent_patients), 1
    ) if recent_patients else 0

    context = {
        'total_patients': total_patients,
        'normal_count': normal_count,
        'pneumonia_count': pneumonia_count,
        'normal_rate': normal_rate,
        'pneumonia_rate': pneumonia_rate,
        'average_confidence': average_confidence,
        'recent_patients': recent_patients,
    }
    return render(request, 'detector/dashboard.html', context)

@login_required
def predict(request):
    """Handle image upload and patient data, run prediction."""
    if request.method == 'POST':
        if not request.FILES.get('xray_image'):
            return render(request, 'detector/predict.html', {'error': 'No file uploaded'})

        first_name = request.POST.get('first_name', '')
        last_name = request.POST.get('last_name', '')
        date_of_birth = request.POST.get('date_of_birth')
        phone_number = request.POST.get('phone_number', '')
        xray_image = request.FILES['xray_image']

        # Validate date of birth: must be in the past
        if date_of_birth:
            try:
                dob = date.fromisoformat(date_of_birth)
                if dob >= date.today():
                    return render(request, 'detector/predict.html', {'error': 'Date of birth must be before today.'})
            except ValueError:
                return render(request, 'detector/predict.html', {'error': 'Invalid date of birth.'})

        # Validate phone number: +213 followed by 5, 6, or 7 then 8 digits
        if not re.match(r'^\+213[567]\d{8}$', phone_number):
            return render(request, 'detector/predict.html', {'error': 'Phone number must be in format +213XXXXXXXXX (starting with 5, 6, or 7).'})

        # Create Patient record temporarily to get the saved file path
        patient = Patient(
            first_name=first_name,
            last_name=last_name,
            date_of_birth=date_of_birth,
            phone_number=phone_number,
            xray_image=xray_image,
            prediction='Pending',
            confidence_score=0.0
        )
        patient.save()
        
        # Run inference using the saved file path
        file_path = patient.xray_image.path
        result = predict_pneumonia(file_path)
        
        if result['status'] == 'success':
            patient.prediction = result['prediction']
            patient.confidence_score = result['confidence']
            if 'models' in result:
                patient.model_results = result['models']
            patient.save()
            return redirect('result', patient_id=patient.id)
        else:
            patient.delete() # cleanup on error
            return render(request, 'detector/predict.html', {'error': result['message']})
            
    return render(request, 'detector/predict.html')

@login_required
def result(request, patient_id):
    """Render the results page for a specific patient."""
    patient = get_object_or_404(Patient, id=patient_id)
    return render(request, 'detector/result.html', {'patient': patient})


@login_required
def patient_list(request):
    """Render a paginated patient table with filtering and sorting."""
    search_field = request.GET.get('search_field', 'first_name')
    search_query = request.GET.get('search_query', '').strip()
    sort_by = request.GET.get('sort_by', '-created_at')

    searchable_fields = {
        'first_name': 'first_name__icontains',
        'last_name': 'last_name__icontains',
        'phone_number': 'phone_number__icontains',
        'prediction': 'prediction__icontains',
    }
    sortable_fields = {
        'first_name': 'first_name',
        'last_name': 'last_name',
        'phone_number': 'phone_number',
        'prediction': 'prediction',
        'confidence_score': 'confidence_score',
        'created_at': 'created_at',
        '-created_at': '-created_at',
        '-confidence_score': '-confidence_score',
    }

    patients_qs = Patient.objects.all()

    if search_query and search_field in searchable_fields:
        patients_qs = patients_qs.filter(Q(**{searchable_fields[search_field]: search_query}))

    patients_qs = patients_qs.order_by(sortable_fields.get(sort_by, '-created_at'))

    per_page = request.GET.get('per_page', '10')
    if per_page not in ('5', '10', '20'):
        per_page = '10'

    paginator = Paginator(patients_qs, int(per_page))
    page_obj = paginator.get_page(request.GET.get('page'))

    query_params = request.GET.copy()
    query_params.pop('page', None)

    context = {
        'patients': page_obj.object_list,
        'page_obj': page_obj,
        'search_field': search_field,
        'search_query': search_query,
        'sort_by': sort_by,
        'per_page': per_page,
        'page_query': query_params.urlencode(),
    }
    return render(request, 'detector/patient_list.html', context)


@login_required
def patient_edit(request, patient_id):
    """Edit patient information."""
    patient = get_object_or_404(Patient, id=patient_id)

    if request.method == 'POST':
        first_name = request.POST.get('first_name', '').strip()
        last_name = request.POST.get('last_name', '').strip()
        date_of_birth = request.POST.get('date_of_birth')
        phone_number = request.POST.get('phone_number', '').strip()

        if date_of_birth:
            try:
                dob = date.fromisoformat(date_of_birth)
                if dob >= date.today():
                    return render(request, 'detector/patient_edit.html', {
                        'patient': patient, 'error': 'Date of birth must be before today.'
                    })
            except ValueError:
                return render(request, 'detector/patient_edit.html', {
                    'patient': patient, 'error': 'Invalid date of birth.'
                })

        if not re.match(r'^\+213[567]\d{8}$', phone_number):
            return render(request, 'detector/patient_edit.html', {
                'patient': patient, 'error': 'Phone number must be in format +213XXXXXXXXX (starting with 5, 6, or 7).'
            })

        patient.first_name = first_name
        patient.last_name = last_name
        patient.date_of_birth = date_of_birth
        patient.phone_number = phone_number
        patient.save()
        return redirect('patient_list')

    return render(request, 'detector/patient_edit.html', {'patient': patient})


@login_required
def patient_delete(request, patient_id):
    """Delete a patient record."""
    patient = get_object_or_404(Patient, id=patient_id)
    if request.method == 'POST':
        patient.delete()
    return redirect('patient_list')


@login_required
def profile(request):
    """Read-only profile page."""
    profile_obj, _ = UserProfile.objects.get_or_create(user=request.user)
    return render(request, 'detector/profile.html', {
        'profile_user': request.user,
        'profile_obj': profile_obj,
    })


@login_required
def account_settings(request):
    """View and edit account settings, including password change."""
    user = request.user
    UserModel = get_user_model()
    profile_obj, _ = UserProfile.objects.get_or_create(user=user)
    active_tab = request.GET.get('tab', 'account')

    if request.method == 'POST':
        form_type = request.POST.get('form_type', 'account')
        active_tab = 'security' if form_type == 'password' else 'account'

        if form_type == 'password':
            current_password = request.POST.get('current_password', '')
            new_password = request.POST.get('new_password', '')
            confirm_password = request.POST.get('confirm_password', '')

            if not user.check_password(current_password):
                messages.error(request, 'Current password is incorrect.')
            elif len(new_password) < 8:
                messages.error(request, 'New password must be at least 8 characters long.')
            elif new_password != confirm_password:
                messages.error(request, 'New password and confirmation do not match.')
            elif current_password == new_password:
                messages.error(request, 'New password must be different from the current password.')
            else:
                user.set_password(new_password)
                user.save()
                update_session_auth_hash(request, user)
                messages.success(request, 'Password updated successfully.')
                return redirect(f"{reverse('account_settings')}?tab=security")
        else:
            username = request.POST.get('username', '').strip()
            first_name = request.POST.get('first_name', '').strip()
            last_name = request.POST.get('last_name', '').strip()
            email = request.POST.get('email', '').strip()
            uploaded_image = request.FILES.get('profile_image')

            if not username:
                messages.error(request, 'Username is required.')
            elif UserModel.objects.exclude(pk=user.pk).filter(username=username).exists():
                messages.error(request, 'This username is already taken.')
            elif email and UserModel.objects.exclude(pk=user.pk).filter(email=email).exists():
                messages.error(request, 'This email is already used by another account.')
            else:
                user.username = username
                user.first_name = first_name
                user.last_name = last_name
                user.email = email
                user.save()

                if uploaded_image:
                    profile_obj.profile_image = uploaded_image
                    profile_obj.save()

                messages.success(request, 'Account settings updated successfully.')
                return redirect(f"{reverse('account_settings')}?tab=account")

    return render(request, 'detector/account_settings.html', {
        'profile_user': user,
        'profile_obj': profile_obj,
        'active_tab': active_tab,
    })
