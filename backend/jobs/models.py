from django.db import models
from users.models import EmployerProfile, CandidateProfile

class Sector(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name

class Neighborhood(models.Model):
    city = models.CharField(max_length=100, default='Douala')
    name = models.CharField(max_length=100)
    
    class Meta:
        unique_together = ('city', 'name')

    def __str__(self):
        return f"{self.name} ({self.city})"

class JobOffer(models.Model):
    title = models.CharField(max_length=255)
    employer = models.ForeignKey(EmployerProfile, on_delete=models.CASCADE, related_name='job_offers', null=True, blank=True)
    neighborhood = models.ForeignKey(Neighborhood, on_delete=models.SET_NULL, null=True, blank=True, related_name='job_offers')
    sector = models.ForeignKey(Sector, on_delete=models.SET_NULL, null=True, blank=True, related_name='job_offers')
    
    description = models.TextField()
    start_date = models.CharField(max_length=100, blank=True, null=True) # e.g., "Demain"
    duration = models.CharField(max_length=100, blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True, help_text="Date à laquelle l'offre se termine pour l'auto-complétion")
    budget = models.CharField(max_length=100, blank=True, null=True)
    
    is_urgent = models.BooleanField(default=False)
    contact_whatsapp = models.CharField(max_length=20, blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Ads system
    is_ad = models.BooleanField(default=False)
    ad_url = models.URLField(max_length=500, blank=True, null=True)
    ad_image_url = models.URLField(max_length=500, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} - {self.employer.company_name or self.employer.user.username}"


class Application(models.Model):
    STATUS_CHOICES = (
        ('pending', 'En attente'),
        ('accepted', 'Acceptée'),
        ('rejected', 'Refusée'),
        ('withdrawn', 'Retirée'),
        ('completed', 'Terminée'),
    )

    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='applications')
    job_offer = models.ForeignKey(JobOffer, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_reviewed = models.BooleanField(default=False)
    match_score = models.IntegerField(default=0, help_text="Match score percentage")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('candidate', 'job_offer') # Prevent multiple applications to the same offer

    def __str__(self):
        return f"Application by {self.candidate.user.username} for {self.job_offer.title}"
