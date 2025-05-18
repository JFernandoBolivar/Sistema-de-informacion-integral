from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

class UserSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo User usado para registro y actualizaciones.
    Incluye validación para department según el status del usuario.
    """
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['id', 'cedula', 'email', 'phone', 'username', 'password', 'confirm_password', 'status', 'department', 'first_name', 'last_name']
        extra_kwargs = {
            'cedula': {'required': True},
            'email': {'required': True},
            'status': {'read_only': True},  # Solo los administradores pueden cambiar el estado
            'department': {'required': True}  # El departamento es obligatorio
        }

    def validate_cedula(self, value):
        """
        Validar que la cédula tenga entre 8 y 10 dígitos
        """
        # Eliminar caracteres no numéricos
        digits_only = ''.join(filter(str.isdigit, value))
        
        # Verificar longitud
        if len(digits_only) < 8:
            raise serializers.ValidationError("La cédula debe tener al menos 8 dígitos.")
        if len(digits_only) > 10:
            raise serializers.ValidationError("La cédula no debe tener más de 10 dígitos.")
            
        return value

    def validate(self, data):
        # Verificar si las contraseñas coinciden
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Las contraseñas no coinciden."})
        
        # Validar la relación entre status y department
        status = data.get('status', 'basic')  # Por defecto es 'basic'
        department = data.get('department')
        
        # Para usuarios nuevos (create), status será 'basic'
        if status == 'superAdmin':
            # superAdmin siempre debe tener department='none'
            data['department'] = 'none'
        elif status in ['admin', 'basic'] and (not department or department == 'none'):
            # admin y basic deben tener un departamento válido
            raise serializers.ValidationError({
                "department": "Los usuarios admin y basic deben tener un departamento asignado (OAC, Farmacia o Almacén)."
            })
            
        return data

    def create(self, validated_data):
        # Eliminar confirm_password de los datos validados
        validated_data.pop('confirm_password', None)
        
        # Crear el usuario con los datos validados
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            cedula=validated_data['cedula'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', ''),
            status='basic',  # Estado predeterminado para nuevos usuarios
            department=validated_data.get('department')  # Departamento especificado
        )
        return user
    
    def update(self, instance, validated_data):
        # Eliminar password y confirm_password de los datos validados si existen
        validated_data.pop('password', None)
        validated_data.pop('confirm_password', None)
        
        # Actualizar campos del usuario
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class AdminUserUpdateSerializer(UserSerializer):
    """
    Serializador para que los administradores actualicen usuarios, incluyendo el estado.
    Permite cambiar tanto el status como el department, con validaciones para combinaciones válidas.
    """
    class Meta(UserSerializer.Meta):
        extra_kwargs = {
            'cedula': {'required': True},
            'email': {'required': True},
            'status': {'required': False},  # Los administradores pueden cambiar el estado
            'department': {'required': False}  # Los administradores pueden cambiar el departamento
        }
    
    def validate(self, data):
        # Primero realizar las validaciones del padre
        data = super().validate(data)
        
        # Obtener la instancia o usar valores de data
        instance = self.instance
        
        # Determinar status final (instancia actual o nuevo valor en data)
        status = data.get('status', instance.status if instance else 'basic')
        # Determinar department final (instancia actual o nuevo valor en data)
        department = data.get('department', instance.department if instance else 'none')
        
        # Aplicar reglas de validación
        if status == 'superAdmin':
            # superAdmin siempre debe tener department='none'
            data['department'] = 'none'
        elif status in ['admin', 'basic'] and (department == 'none'):
            # admin y basic deben tener un departamento válido
            raise serializers.ValidationError({
                "department": "Los usuarios admin y basic deben tener un departamento asignado (OAC, Farmacia o Almacén)."
            })
            
        return data

class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializador específicamente diseñado para actualizaciones parciales de información de usuario.
    No requiere campos de contraseña y soporta peticiones PATCH.
    No permite cambiar status ni department (solo admin puede cambiarlos).
    """
    class Meta:
        model = User
        fields = ['id', 'cedula', 'email', 'phone', 'username', 'first_name', 'last_name', 'department']
        extra_kwargs = {
            'cedula': {'required': False},
            'email': {'required': False},
            'username': {'required': False},
            'phone': {'required': False},
            'first_name': {'required': False},
            'last_name': {'required': False},
            'department': {'read_only': True},  # Usuario normal no puede cambiar su departamento
        }

    def validate_email(self, value):
        """
        Validar la unicidad del email solo si ha cambiado
        """
        user = self.instance
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("Este correo electrónico ya está en uso.")
        return value

    def validate_cedula(self, value):
        """
        Validar la unicidad de la cédula solo si ha cambiado
        y verificar que tenga entre 8 y 10 dígitos
        """
        # Validar longitud
        # Eliminar caracteres no numéricos
        digits_only = ''.join(filter(str.isdigit, value))
        
        # Verificar longitud
        if len(digits_only) < 8:
            raise serializers.ValidationError("La cédula debe tener al menos 8 dígitos.")
        if len(digits_only) > 10:
            raise serializers.ValidationError("La cédula no debe tener más de 10 dígitos.")
        
        # Validar unicidad
        user = self.instance
        if User.objects.exclude(pk=user.pk).filter(cedula=value).exists():
            raise serializers.ValidationError("Este número de cédula ya está en uso.")
        return value

    def validate_username(self, value):
        """
        Validar la unicidad del nombre de usuario solo si ha cambiado
        """
        user = self.instance
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError("Este nombre de usuario ya está en uso.")
        return value

class LoginSerializer(serializers.Serializer):
    """
    Serializador para inicio de sesión de usuario. Requiere cédula y contraseña.
    """
    cedula = serializers.CharField(max_length=10, required=True)
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    def validate(self, data):
        cedula = data.get('cedula')
        password = data.get('password')

        if cedula and password:
            # Intentar obtener el usuario por cédula
            try:
                user = User.objects.get(cedula=cedula)
                # Verificar la contraseña
                if user.check_password(password):
                    data['user'] = user
                else:
                    raise serializers.ValidationError("Credenciales inválidas. Por favor, intente de nuevo.")
            except User.DoesNotExist:
                raise serializers.ValidationError("Credenciales inválidas. Por favor, intente de nuevo.")
        else:
            raise serializers.ValidationError("La cédula y la contraseña son requeridos.")
            
        return data

