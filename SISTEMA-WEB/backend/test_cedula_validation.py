# Script para probar la validación de cédula en Django shell
# Ejecutar con: python manage.py shell < test_cedula_validation.py

from accounts.serializers import UserSerializer, UserUpdateSerializer
from accounts.models import User
from rest_framework.exceptions import ValidationError
from django.db import transaction

# Función para probar un valor de cédula con un serializador
def test_cedula(serializer_class, value, is_update=False):
    print(f"\nProbando cédula: '{value}'")
    
    # Preparar los datos de prueba
    data = {
        'username': 'testuser',
        'email': 'test@example.com',
        'cedula': value,
        'password': 'password123',
        'confirm_password': 'password123',
        'department': 'oac',
    }
    
    # Para pruebas de actualización, necesitamos una instancia
    instance = None
    if is_update:
        try:
            # Buscar un usuario existente o crear uno para la prueba
            instance = User.objects.filter(username__startswith='testuser').first()
            if not instance:
                print("No hay usuario de prueba, saltando prueba de actualización")
                return
        except User.DoesNotExist:
            print("No hay usuario de prueba, saltando prueba de actualización")
            return
    
    # Crear el serializador
    serializer = serializer_class(instance=instance, data=data) if is_update else serializer_class(data=data)
    
    # Probar la validación de la cédula
    try:
        if hasattr(serializer, 'validate_cedula'):
            result = serializer.validate_cedula(value)
            print(f"✅ Validación exitosa. Valor devuelto: '{result}'")
        else:
            print("❌ El serializador no tiene método validate_cedula")
    except ValidationError as e:
        print(f"❌ Error de validación: {e.detail}")

print("=== PRUEBAS DE VALIDACIÓN DE CÉDULA ===")

# Probar cédulas válidas (8, 9 y 10 dígitos)
print("\n--- CÉDULAS VÁLIDAS ---")
test_cedula(UserSerializer, "12345678")       # 8 dígitos
test_cedula(UserSerializer, "123456789")      # 9 dígitos
test_cedula(UserSerializer, "1234567890")     # 10 dígitos

# Probar cédulas con formato pero válidas
print("\n--- CÉDULAS CON FORMATO PERO VÁLIDAS ---")
test_cedula(UserSerializer, "123-456-78")     # 8 dígitos con guiones
test_cedula(UserSerializer, "123.456.789")    # 9 dígitos con puntos
test_cedula(UserSerializer, "V-12345678")     # Prefijo común en Venezuela

# Probar cédulas inválidas (menos de 8 o más de 10 dígitos)
print("\n--- CÉDULAS INVÁLIDAS ---")
test_cedula(UserSerializer, "1234567")        # 7 dígitos (muy corta)
test_cedula(UserSerializer, "12345678901")    # 11 dígitos (muy larga)
test_cedula(UserSerializer, "123")            # 3 dígitos (muy corta)
test_cedula(UserSerializer, "")               # Vacía

# Probar cédulas con caracteres no numéricos que resultan inválidas
print("\n--- CÉDULAS CON CARACTERES NO NUMÉRICOS QUE RESULTAN INVÁLIDAS ---")
test_cedula(UserSerializer, "ABCD-123")       # Muy pocos dígitos después de filtrar
test_cedula(UserSerializer, "V-123-456")      # 7 dígitos después de filtrar

print("\nPruebas completadas.")

