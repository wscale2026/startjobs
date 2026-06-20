from django.contrib import admin
from .models import Sector, Neighborhood, JobOffer, Application

@admin.register(Sector)
class SectorAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Neighborhood)
class NeighborhoodAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(JobOffer)
class JobOfferAdmin(admin.ModelAdmin):
    list_display = ('title', 'employer', 'sector', 'neighborhood', 'is_urgent', 'is_active', 'created_at')
    list_filter = ('is_urgent', 'is_active', 'is_ad', 'sector', 'neighborhood')
    search_fields = ('title', 'employer__company_name', 'employer__user__username', 'description')

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('candidate', 'job_offer', 'status', 'match_score', 'created_at')
    list_filter = ('status',)
    search_fields = ('candidate__user__username', 'job_offer__title')
