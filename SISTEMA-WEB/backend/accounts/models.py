from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager as DjangoUserManager
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError

class UserManager(DjangoUserManager):
    """
    Manager personalizado para el modelo User que asegura que los superusuarios
    se creen con status='superAdmin' y department='none'
    """
    def create_superuser(self, username, email, password, **extra_fields):
        # Asegurar que se establezcan los campos is_staff, is_superuser
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        # Establecer status='superAdmin' y department='none' para superusuarios
        extra_fields['status'] = 'superAdmin'
        extra_fields['department'] = 'none'
        
        return super().create_superuser(username, email, password, **extra_fields)

class User(AbstractUser):
    # Opciones de estado de usuario
    STATUS_CHOICES = [
        ('admin', _('Admin')),
        ('superAdmin', _('Super Admin')),
        ('basic', _('Basic')),
    ]
    
    # Opciones de departamento
    DEPARTMENT_CHOICES = [
        ('oac', _('OAC')),
        ('farmacia', _('Farmacia')),
        ('almacen', _('Almacén')),
        ('none', _('Sin departamento')),
    ]
    
    cedula = models.CharField(_('ID number'), max_length=20, unique=True)
    email = models.EmailField(_('email address'), unique=True)
    phone = models.CharField(_('phone number'), max_length=15, blank=True, null=True)
    status = models.CharField(
        _('status'),
        max_length=10,
        choices=STATUS_CHOICES,
        default='basic',
    )
    department = models.CharField(
        _('department'),
        max_length=10,
        choices=DEPARTMENT_CHOICES,
        default='none',
        help_text=_('Departamento al que pertenece el usuario')
    )
    
    # Asignar el manager personalizado
    objects = UserManager()
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'cedula']
    
    def clean(self):
        """
        Validar las combinaciones de status y department:
        - superAdmin debe tener department='none'
        - admin y basic deben tener un department válido (no 'none')
        """
        super().clean()
        
        # superAdmin siempre debe tener department='none'
        if self.status == 'superAdmin':
            self.department = 'none'
            return  # No aplicar más validaciones para superusuarios
        
        # admin y basic deben tener un department válido (no 'none')
        if self.department == 'none':
            raise ValidationError({
                'department': _('Los usuarios admin y basic deben tener un departamento asignado (OAC, Farmacia o Almacén)')
            })
    
    def save(self, *args, **kwargs):
        # Si es un superusuario, establecer status y department automáticamente
        if self.is_superuser:
            self.status = 'superAdmin'
            self.department = 'none'
        
        self.clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        if self.status == 'superAdmin':
            return f"{self.username} (Super Admin)"
        return f"{self.username} ({self.get_status_display()} - {self.get_department_display()})"
