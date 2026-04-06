from datetime import date

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


class Patient(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField(null=True, blank=True)
    phone_number = models.CharField(max_length=20)

    # We save uploaded images to media/xrays/
    xray_image = models.ImageField(upload_to='xrays/')

    # Store the prediction output
    prediction = models.CharField(max_length=20)
    confidence_score = models.FloatField()

    # Store individual model predictions
    model_results = models.JSONField(default=dict)

    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def age(self):
        if self.date_of_birth:
            today = date.today()
            return today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        return "Unknown"

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.prediction})"


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    profile_image = models.ImageField(upload_to='profile_pics/', null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} profile"


@receiver(post_save, sender=get_user_model())
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=get_user_model())
def save_user_profile(sender, instance, **kwargs):
    UserProfile.objects.get_or_create(user=instance)
