from rest_framework import permissions

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit or delete it.
    Assumes the model instance has an `employer`, `candidate` or `user` attribute.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Always allow admins
        if request.user.is_staff:
            return True

        # Check ownership based on model attributes
        if hasattr(obj, 'employer'):
            return hasattr(request.user, 'employer_profile') and obj.employer == request.user.employer_profile
        elif hasattr(obj, 'candidate'):
            return hasattr(request.user, 'candidate_profile') and obj.candidate == request.user.candidate_profile
        elif hasattr(obj, 'user'):
            return obj.user == request.user

        return False
