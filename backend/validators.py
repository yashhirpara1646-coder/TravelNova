import re

def validate_email(email):
    """Validate email address format using regular expression."""
    if not email:
        return False
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email.strip()))

def validate_password(password):
    """
    Validate password rules:
    - Min 8 characters
    - Starts with capital letter
    - Contains at least 1 special character
    - Contains at least 1 number
    """
    errors = []
    if not password or len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    if not password or not password[0].isupper():
        errors.append("First character of password must be CAPITAL letter")
    if not re.search(r'[!@#$%^&*(),.?":{}|<>\-_]', password):
        errors.append("Password must contain at least one special character (!@#$%^&* etc.)")
    if not re.search(r'\d', password):
        errors.append("Password must contain at least one number (0-9)")
    return errors

POPULAR_CITIES = {
    'indian': ['Jaipur', 'Goa', 'Manali', 'Udaipur', 'Agra', 'Varanasi', 'Shimla', 'Amritsar', 'Delhi', 'Mumbai', 'Ahmedabad', 'Rajkot'],
    'international': ['Paris', 'Tokyo', 'London', 'Dubai', 'Singapore', 'Rome', 'Bangkok', 'Bali', 'New York', 'Cairo', 'Sydney', 'Amsterdam']
}
