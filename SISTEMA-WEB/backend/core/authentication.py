from rest_framework.authentication import SessionAuthentication

class CSRFExemptSessionAuthentication(SessionAuthentication):
    """
    Autenticación por sesión que omite la verificación CSRF.
    Usar esta clase para APIs REST que no requieren protección CSRF
    pero necesitan autenticación por sesión.
    """
    def enforce_csrf(self, request):
        # No aplicar verificación CSRF para APIs
        return None

