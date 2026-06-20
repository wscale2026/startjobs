from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin
from .models import User, EmployerProfile, CandidateProfile, Skill, Language, Experience

@admin.register(User)
class UserAdmin(DefaultUserAdmin):
    fieldsets = DefaultUserAdmin.fieldsets + (
        ('StartJobs Info', {'fields': ('role',)}),
    )
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')

@admin.register(EmployerProfile)
class EmployerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'company_name', 'phone', 'verified')
    list_filter = ('verified',)
    search_fields = ('company_name', 'user__username', 'user__email')

class ExperienceInline(admin.TabularInline):
    model = Experience
    extra = 1

@admin.register(CandidateProfile)
class CandidateProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'neighborhood', 'profile_type', 'score', 'total_missions', 'is_available')
    list_filter = ('profile_type', 'is_available', 'has_license')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name', 'neighborhood')
    inlines = [ExperienceInline]
    filter_horizontal = ('skills', 'languages')

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)
