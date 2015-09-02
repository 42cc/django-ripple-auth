# -*- coding: utf-8 -*-

# system
# ..

# django
from django.contrib.auth import get_user_model


# third party
# ..


class RippleAuthBackend:
    """
    Authentication backend for ripple-based login
    """
    def authenticate(self, username=None, ripple_address=None):
        try:
            # Try to find a user with specified ripple address in profile
            user = get_user_model().objects.get(username=username)
            return user
        except get_user_model().DoesNotExist:
            # Create new user with specified ripple address
            new_user = get_user_model().objects.create_user(
                username=username,
                password=get_user_model().objects.make_random_password(
                    length=15)
            )
            return new_user

    # Required for your backend to work properly - unchanged in most scenarios
    def get_user(self, user_id):
        try:
            return get_user_model().objects.get(pk=user_id)
        except get_user_model().DoesNotExist:
            return None
