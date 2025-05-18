from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from .models import User
from .serializers import UserSerializer, LoginSerializer, AdminUserUpdateSerializer, UserUpdateSerializer

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permiso personalizado para permitir solo a los propietarios de un objeto o administradores editarlo.
    Reglas:
    - superAdmin puede editar cualquier usuario
    - admin solo puede editar usuarios de su mismo departamento
    - usuarios básicos solo pueden editar su propio perfil
    """
    def has_object_permission(self, request, view, obj):
        # Verificar si el usuario está modificando su propio perfil
        if obj.id == request.user.id:
            return True
        
        # superAdmin puede editar cualquier usuario
        if request.user.status == 'superAdmin':
            return True
        
        # admin solo puede editar usuarios de su mismo departamento
        if request.user.status == 'admin':
            # Verificar si el objeto es un usuario
            if isinstance(obj, User):
                # Mismo departamento y no es superAdmin
                return (obj.department == request.user.department and 
                        obj.status != 'superAdmin')
            return False
        
        # Usuarios básicos solo pueden editar su propio perfil (ya verificado arriba)
        return False

class RegisterView(generics.CreateAPIView):
    """
    Endpoint de la API para registro de usuarios.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Crear token para el nuevo usuario
        token, created = Token.objects.get_or_create(user=user)
        
        user_data = UserSerializer(user, context=self.get_serializer_context()).data
        
        return Response({
            'user': user_data,
            'token': token.key,
            'department': user.department,
            'department_display': user.get_department_display()
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    """
    Endpoint de la API para inicio de sesión de usuarios usando cédula.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        login(request, user)
        
        # Obtener o crear token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'user_id': user.id,
            'username': user.username,
            'token': token.key,
            'status': user.status,
            'department': user.department,
            'department_display': user.get_department_display()
        }, status=status.HTTP_200_OK)

class LogoutView(APIView):
    """
    Endpoint de la API para cierre de sesión de usuarios.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Eliminar el token para cerrar sesión
        request.user.auth_token.delete()
        logout(request)
        return Response({"message": "Sesión cerrada exitosamente."}, status=status.HTTP_200_OK)

class UserUpdateView(generics.RetrieveUpdateAPIView):
    """
    Endpoint de la API para obtener y actualizar información de usuarios.
    
    Reglas de acceso:
    - superAdmin puede ver y actualizar cualquier usuario
    - admin puede ver y actualizar usuarios de su mismo departamento 
    - usuarios básicos solo pueden ver y actualizar su propio perfil
    """
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    
    def get_queryset(self):
        """
        Filtrar el queryset según el rol y departamento del usuario:
        - superAdmin ve todos los usuarios
        - admin ve usuarios de su mismo departamento
        - usuarios básicos solo se ven a sí mismos
        """
        user = self.request.user
        if user.status == 'superAdmin':
            return User.objects.all()
        elif user.status == 'admin':
            # Admin solo ve usuarios de su departamento
            return User.objects.filter(department=user.department)
        else:
            # Usuario básico solo se ve a sí mismo
            return User.objects.filter(id=user.id)
    
    def get_serializer_class(self):
        # Diferentes serializadores basados en el método de la solicitud y el rol del usuario
        if self.request.method in ['PUT', 'PATCH']:
            # Para operaciones de actualización
            user = self.request.user
            if user.status == 'superAdmin':
                # superAdmin puede usar todas las opciones
                return AdminUserUpdateSerializer
            elif user.status == 'admin':
                # admin puede cambiar status y department dentro de su departamento
                target_user = self.get_object()
                if target_user.department == user.department:
                    return AdminUserUpdateSerializer
            # Para usuarios básicos o cuando admin edita usuarios de otro departamento
            return UserUpdateSerializer
        # Para operaciones GET
        return UserSerializer
    
    def get_object(self):
        # Si no hay pk en la URL, devolver el usuario actual
        pk = self.kwargs.get('pk')
        if pk is None:
            return self.request.user
        return super().get_object()
