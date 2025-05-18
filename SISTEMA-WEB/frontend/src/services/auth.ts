/**
 * Servicio de autenticación para manejar la interacción con el backend
 * Este servicio maneja el login, logout y la gestión de tokens
 */

// Tipo para los datos de login
interface LoginCredentials {
  cedula: string;
  password: string;
}

// Tipo para los datos de registro
interface RegistrationCredentials {
  cedula: string;             // Cédula (8-10 dígitos)
  password: string;           // Contraseña de mínimo 6 caracteres
  confirmPassword?: string;   // Campo del frontend para confirmar contraseña
  confirm_password?: string;  // Campo que espera el backend
  nombre: string;             // Campo del frontend
  apellido: string;           // Campo del frontend
  department: string;         // Departamento (farmacia, oac, servicios-medicos)
  status?: string;            // Siempre será 'basic' para registros de administradores departamentales
  username?: string;          // Si no se proporciona, se generará a partir de la cédula
  email: string;              // Correo electrónico, obligatorio
  phone?: string;             // Teléfono, opcional para el backend
  // Campos exactos que espera el backend
  first_name?: string;        // Se mapeará desde 'nombre'
  last_name?: string;         // Se mapeará desde 'apellido'
}

// Tipo para la respuesta del login desde el backend
interface LoginResponse {
  user_id: number;
  username: string;
  token: string;
  status: string;
  department: string;
  department_display: string;
}

// Tipo para la respuesta del registro desde el backend
interface RegistrationResponse {
  user_id: number;
  username: string;
  status: string;
  department: string;
  success: boolean;
  message: string;
}

// Tipo para el objeto de error
interface ApiError {
  message: string;
  status?: number;
}

// Opciones de configuración para el API
// Entornos de desarrollo posibles con sus respectivas URLs
const DEV_SERVERS = [
  'http://127.0.0.1:8000',
  'http://localhost:8000',
  'http://192.168.1.100:8000', // IP local común
  'http://0.0.0.0:8000'        // Todas las interfaces
];

// Tiempo máximo de espera para conexiones (ms)
const CONNECTION_TIMEOUT = 15000; // Aumentado a 15 segundos para permitir conexiones más lentas

// Obtener la URL base actual
const getApiUrl = (): string => {
  // Primero intentar con la variable de entorno configurada
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Si estamos en producción, redirigir a la URL correcta
  if (process.env.NODE_ENV === 'production') {
    // URL para producción, podría ser relativa para mismo origen
    return '';  // URL vacía para mismo origen en producción
  }

  // En desarrollo, intentar usar el servidor guardado en localStorage 
  // si existe (para mantener consistencia entre recargas)
  if (typeof window !== 'undefined') {
    const savedServer = localStorage.getItem('dev_api_server');
    if (savedServer && DEV_SERVERS.includes(savedServer)) {
      return savedServer;
    }
  }

  // Si no hay un servidor guardado, usar el primero de la lista
  return DEV_SERVERS[0];
};

// URL base para las peticiones API
const API_URL = getApiUrl();

// Determinar si debemos incluir credenciales en las peticiones
// En mismo origen siempre incluir, en cross-origin solo si está configurado
const determineCredentialsMode = (): RequestCredentials => {
  // Si está explícitamente configurado, respetar esa configuración
  if (process.env.NEXT_PUBLIC_USE_CREDENTIALS === 'true') {
    return 'include';
  }
  if (process.env.NEXT_PUBLIC_USE_CREDENTIALS === 'false') {
    return 'omit';
  }
  
  // En producción o si la URL API está vacía (mismo origen), usar 'same-origin'
  if (process.env.NODE_ENV === 'production' || API_URL === '') {
    return 'same-origin';
  }
  
  // Para desarrollo cross-origin, incluir credenciales por defecto
  return 'include';
};

const USE_CREDENTIALS = determineCredentialsMode();

// Habilitar logs de depuración
const DEBUG = process.env.NEXT_PUBLIC_DEBUG === 'true' || process.env.NODE_ENV === 'development';

// Función de ayuda para logs
const log = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[Auth Service] ${message}`, data || '');
  }
};

/**
 * Realiza la petición de login al backend
 * @param credentials Credenciales del usuario (cédula y contraseña)
 * @returns Datos del usuario y token si el login es exitoso
 * @throws Error si las credenciales son inválidas o hay un problema de conexión
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  let currentApiUrl = API_URL;
  let attemptCount = 0;
  const MAX_ATTEMPTS = 2; // Intentar hasta 2 veces (original + 1 reintento)
  
  try {
    log(`Intentando login en: ${currentApiUrl}/api/login/`);
    log(`Modo de credenciales: ${USE_CREDENTIALS}`);
    
    // Crear un AbortController para manejar timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT);
    
    const fetchWithTimeout = async (): Promise<Response> => {
      try {
        // Intentar con la URL actual
        return await fetch(`${currentApiUrl}/api/login/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify({
            cedula: credentials.cedula,
            password: credentials.password,
          }),
          credentials: USE_CREDENTIALS,
          signal: controller.signal,
        });
      } catch (error) {
        // Si falla y hay más servidores para probar en desarrollo
        if (attemptCount < MAX_ATTEMPTS && process.env.NODE_ENV !== 'production') {
          attemptCount++;
          // Intentar con el siguiente servidor de la lista
          const nextServerIndex = DEV_SERVERS.indexOf(currentApiUrl) + 1;
          if (nextServerIndex < DEV_SERVERS.length) {
            currentApiUrl = DEV_SERVERS[nextServerIndex];
            log(`Reintentando con servidor alternativo: ${currentApiUrl}`);
            // Recursivamente intentar de nuevo
            return fetchWithTimeout();
          }
        }
        // Si no hay más alternativas, relanzar el error
        throw error;
      }
    };
    
    const response = await fetchWithTimeout();
    
    // Limpiar el timeout después de obtener la respuesta
    clearTimeout(timeoutId);
    
    // Si encontramos un servidor que funciona, guardarlo para uso futuro
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      localStorage.setItem('dev_api_server', currentApiUrl);
    }

    // Si la respuesta no es exitosa
    if (!response.ok) {
      console.error(`Error de servidor: ${response.status} ${response.statusText}`);
      
      let errorMessage = 'Error en el servidor';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || 'Error en el servidor';
      } catch (e) {
        // Si no podemos leer la respuesta como JSON
        console.error('No se pudo leer la respuesta del servidor como JSON:', e);
      }
      
      throw new Error(errorMessage);
    }

    // Si la respuesta es exitosa, extraer los datos
    const data = await response.json();
    
    // Guardar el token en localStorage para uso futuro
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user_data', JSON.stringify({
      id: data.user_id,
      username: data.username,
      status: data.status,
      department: data.department,
      department_display: data.department_display
    }));
    
    return data;
  } catch (error) {
    // Manejar errores de red o del servidor
    console.error('Error completo:', error);
    
    // Manejar errores específicos
    if (error instanceof Error) {
      // Error de timeout
      if (error.name === 'AbortError') {
        throw new Error('La conexión con el servidor ha excedido el tiempo de espera. Intente nuevamente.');
      }
      
      // Error de CORS
      if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
        throw new Error('Error de acceso al servidor. Problema de configuración CORS. Contacte al administrador.');
      }
      
      // Error de red o servidor no disponible
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError') || 
          error.message.includes('network') ||
          error.message.includes('connection refused')) {
        throw new Error('No se pudo conectar con el servidor. Verifique su conexión e intente nuevamente.');
      }
      
      // Credenciales inválidas (mensaje personalizado desde el backend)
      if (error.message.includes('Credenciales') || 
          error.message.includes('inválidas') || 
          error.message.includes('incorrecta')) {
        throw new Error('Credenciales inválidas. Verifique su cédula y contraseña.');
      }
      
      // Otro error con mensaje
      throw new Error(`Error de autenticación: ${error.message}`);
    }
    
    // Error genérico sin mensaje específico
    throw new Error('Error inesperado durante la autenticación. Intente nuevamente.');
  }
};

/**
 * Cierra la sesión del usuario
 * @returns Promesa que se resuelve cuando se completa el logout
 */
export const logout = async (): Promise<void> => {
  try {
    const token = localStorage.getItem('auth_token');
    
    log('Iniciando proceso de logout');
    
    if (token) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT);
      
      await fetch(`${API_URL}/api/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: USE_CREDENTIALS,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  } finally {
    // Limpiar el almacenamiento local independientemente de la respuesta del servidor
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }
};

/**
 * Verifica si el usuario está autenticado
 * @returns true si hay un token guardado, false en caso contrario
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') {
    return false; // Ejecutándose en el servidor
  }
  
  const token = localStorage.getItem('auth_token');
  return !!token;
};

/**
 * Obtiene los datos del usuario autenticado
 * @returns Datos del usuario o null si no está autenticado
 */
export const getUserData = () => {
  if (typeof window === 'undefined') {
    return null; // Ejecutándose en el servidor
  }
  
  const userData = localStorage.getItem('user_data');
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error al parsear datos del usuario:', error);
    return null;
  }
};

/**
 * Registra un nuevo usuario en el sistema
 * @param userData Datos del nuevo usuario a registrar
 * @returns Respuesta con información sobre el registro exitoso
 * @throws Error si hay problemas durante el registro
 */
export const registerUser = async (userData: RegistrationCredentials): Promise<RegistrationResponse> => {
  try {
    log(`Intentando registrar nuevo usuario para el departamento: ${userData.department}`);
    log('Iniciando registro de usuario con datos:', {
      ...userData,
      password: '[REDACTED]', // No logear la contraseña
      confirmPassword: '[REDACTED]' // No logear la confirmación
    });
    
    // Validar datos requeridos
    if (!userData.cedula || !userData.email || !userData.password) {
      log('Error de validación: Faltan campos requeridos');
      throw new Error('Faltan campos requeridos para el registro');
    }

    // Limpiar espacios en blanco de las contraseñas
    const password = userData.password.trim();
    let confirmPassword = '';
    
    // Obtener y limpiar el campo de confirmación de contraseña, verificando ambos nombres posibles
    if (userData.confirmPassword !== undefined) {
      confirmPassword = userData.confirmPassword.trim();
      log('Campo confirmPassword presente en los datos');
    } else if (userData.confirm_password !== undefined) {
      confirmPassword = userData.confirm_password.trim();
      log('Campo confirm_password presente en los datos');
    } else {
      log('ADVERTENCIA: No se proporcionó campo de confirmación de contraseña');
      confirmPassword = password; // Si no se proporciona, usar la misma contraseña
    }
    
    // Verificar coincidencia de contraseñas
    if (password !== confirmPassword) {
      log('Error de validación: Las contraseñas no coinciden');
      log('Longitud de password: ' + password.length + ', Longitud de confirmPassword: ' + confirmPassword.length);
      throw new Error('Las contraseñas no coinciden. Por favor, verifique que ambas contraseñas sean exactamente iguales.');
    }
    
    // Validar cédula: debe tener entre 8 y 10 dígitos
    const cedulaDigits = userData.cedula.replace(/\D/g, '');
    if (cedulaDigits.length < 8 || cedulaDigits.length > 10) {
      log('Error de validación: La cédula no tiene el formato correcto');
      throw new Error('La cédula debe tener entre 8 y 10 dígitos.');
    }
    
    // Validar formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      log('Error de validación: El correo electrónico no tiene un formato válido');
      throw new Error('El formato del correo electrónico no es válido');
    }
    
    // Validar departamento
    const validDepartments = ['oac', 'farmacia', 'servicios-medicos'];
    if (!validDepartments.includes(userData.department)) {
      log('Error de validación: Departamento inválido', userData.department);
      throw new Error('El departamento especificado no es válido');
    }
    
    // Generar username usando el primer nombre + primera letra del apellido
    let generatedUsername = userData.username;
    
    if (!generatedUsername && userData.nombre && userData.apellido) {
      // Extraer el primer nombre (todo antes del primer espacio)
      const firstNamePart = userData.nombre.split(' ')[0];
      
      // Extraer la primera letra del apellido
      const lastNameInitial = userData.apellido.charAt(0);
      
      // Limpiar y normalizar el nombre y la inicial del apellido
      const cleanText = (text: string) => {
        return text
          .toLowerCase()
          // Normalizar para eliminar acentos
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          // Eliminar caracteres no alfanuméricos
          .replace(/[^a-z0-9]/g, "");
      };
      
      const cleanFirstName = cleanText(firstNamePart);
      const cleanLastInitial = cleanText(lastNameInitial);
      
      // Crear username: nombre + inicial apellido (ej: "josép" -> "josep")
      generatedUsername = cleanFirstName + cleanLastInitial;
      
      // Garantizar unicidad añadiendo un número aleatorio si el nombre es muy corto
      if (generatedUsername.length < 4) {
        // Añadir últimos dígitos de la cédula para garantizar unicidad
        const lastDigits = cedulaDigits.slice(-2);
        generatedUsername += lastDigits;
      }
      
      // Si el nombre está vacío después de limpiarlo, usar prefijo predeterminado
      if (!cleanFirstName) {
        generatedUsername = `user${cedulaDigits.slice(-4)}`;
      }
      
      log(`Generando username automático: ${generatedUsername}`);
    } else if (!generatedUsername) {
      // Si no hay nombre o apellido disponible, usar el formato anterior
      generatedUsername = `user${cedulaDigits.slice(-4)}`;
    }
    
    // Preparar los datos para el envío al backend con los nombres de campos exactos
    const dataToSend = {
      // Campos básicos requeridos por el backend
      cedula: userData.cedula,
      username: generatedUsername,
      email: userData.email,
      password: password, // Usar la versión limpia (trimmed)
      // Mapear confirm_password como lo espera el backend
      confirm_password: confirmPassword, // Usar la versión limpia (trimmed)
      // Mapear nombres de campos como espera el backend
      first_name: userData.nombre,
      last_name: userData.apellido,
      // Campos adicionales
      phone: userData.phone || '',
      department: userData.department,
      status: 'basic', // Siempre registrar como usuario básico
    };
    
    // Asegurar que no hay propiedades undefined o null
    Object.keys(dataToSend).forEach(key => {
      if (dataToSend[key] === undefined || dataToSend[key] === null) {
        delete dataToSend[key];
      }
    });

    // Validación adicional detallada antes de enviar
    console.log('Validación previa al envío:');
    console.log('- Cédula:', { 
      valor: dataToSend.cedula,
      longitudCorrecta: dataToSend.cedula && dataToSend.cedula.replace(/\D/g, '').length >= 8 && dataToSend.cedula.replace(/\D/g, '').length <= 10
    });
    console.log('- Email:', { 
      valor: dataToSend.email,
      formatoValido: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dataToSend.email || '')
    });
    console.log('- Nombre y apellido:', {
      first_name: dataToSend.first_name,
      last_name: dataToSend.last_name,
    });
    console.log('- Departamento:', {
      valor: dataToSend.department,
      esValido: ['oac', 'farmacia', 'servicios-medicos'].includes(dataToSend.department || '')
    });
    console.log('- Contraseñas coinciden:', dataToSend.password === dataToSend.confirm_password);
    console.log('- Detalles de contraseñas:', {
      longitudPassword: dataToSend.password.length,
      longitudConfirmPassword: dataToSend.confirm_password.length,
      passwordConEspacios: dataToSend.password.includes(' '),
      confirmPasswordConEspacios: dataToSend.confirm_password.includes(' '),
      primerosCaracteres: {
        password: dataToSend.password.slice(0, 3) + '...',
        confirmPassword: dataToSend.confirm_password.slice(0, 3) + '...'
      },
      ultimosCaracteres: {
        password: '...' + dataToSend.password.slice(-3),
        confirmPassword: '...' + dataToSend.confirm_password.slice(-3)
      }
    });
    
    log('Datos preparados para envío:', {
      ...dataToSend,
      password: '[REDACTED]',
      confirm_password: '[REDACTED]'
    });
    
    // Verificar token de autenticación
    const authToken = localStorage.getItem('auth_token');
    log('Estado del token de autenticación:', authToken ? 'Presente' : 'Ausente');
    
    if (!authToken) {
      log('Error: No hay token de autenticación disponible');
      throw new Error('No hay token de autenticación. Debe iniciar sesión como administrador.');
    }
    
    // Función de registro con reintentos
    const attemptRegistration = async (registrationData, attempt = 1) => {
      const MAX_ATTEMPTS = 3;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT);

      try {
        log(`Realizando petición POST a ${API_URL}/api/register/ (intento ${attempt} de ${MAX_ATTEMPTS})`);
        
        // Verificar headers de la petición
        log('Headers de la petición:', {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': authToken ? 'Token presente' : 'Token ausente'
        });
        
        const response = await fetch(`${API_URL}/api/register/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            // Incluir token de autenticación del administrador para autorizar el registro
            'Authorization': `Token ${authToken}`,
          },
          body: JSON.stringify(registrationData),
          credentials: USE_CREDENTIALS,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError' && attempt < MAX_ATTEMPTS) {
          log(`Intento ${attempt} fallido por timeout, reintentando...`);
          // Esperar un poco antes de reintentar (usando incremento exponencial)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          return attemptRegistration(registrationData, attempt + 1);
        }
        throw error;
      }
    };
    
    // Usar la función de reintento
    const response = await attemptRegistration(dataToSend);
  
    log('Respuesta del servidor:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });
    
    // Procesar la respuesta JSON (errores de parsing capturados por el catch exterior)
    const responseData = await response.json();
    
    // Si la respuesta no es exitosa
    if (!response.ok) {
      log('Error del servidor:', responseData);
      
      // Registrar información detallada del error para depuración
      console.error('Detalles completos del error:', responseData);
      
      // Extraer mensajes de error específicos del backend
      let errorMessage = '';
      
      // Comprobar si hay errores específicos de campo
      if (responseData.errors && typeof responseData.errors === 'object') {
        // Construir mensaje de error con todos los campos con error
        const errorFields = Object.entries(responseData.errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('; ');
        
        errorMessage = `Errores de validación: ${errorFields}`;
      } 
      // Verificar si hay errores de campo directamente en el objeto de respuesta
      else if (responseData.email || responseData.username || responseData.cedula) {
        // Construir mensaje de error con los campos específicos
        const errorFields = [];
        
        if (responseData.email) {
          const emailErrors = Array.isArray(responseData.email) ? responseData.email.join(', ') : responseData.email;
          // Detectar errores de email duplicado
          if (emailErrors.toLowerCase().includes('already exists') || emailErrors.toLowerCase().includes('ya existe')) {
            errorMessage = 'El correo electrónico ya está registrado en el sistema. Por favor:\n• Si esta cuenta le pertenece, utilice la opción "Olvidé mi contraseña" en la página de inicio de sesión\n• Si necesita crear una cuenta nueva, utilice un correo electrónico diferente';
            throw new Error(errorMessage);
          }
          errorFields.push(`email: ${emailErrors}`);
        }
        
        if (responseData.username) {
          const usernameErrors = Array.isArray(responseData.username) ? responseData.username.join(', ') : responseData.username;
          errorFields.push(`username: ${usernameErrors}`);
        }
        
        if (responseData.cedula) {
          const cedulaErrors = Array.isArray(responseData.cedula) ? responseData.cedula.join(', ') : responseData.cedula;
          errorFields.push(`cedula: ${cedulaErrors}`);
        }
        
        errorMessage = `Errores de validación: ${errorFields.join('; ')}`;
      } else if (responseData.non_field_errors) {
        // Errores generales no asociados a campos específicos
        errorMessage = Array.isArray(responseData.non_field_errors) 
          ? responseData.non_field_errors.join('; ')
          : responseData.non_field_errors;
      } else {
        // Mantener el comportamiento original para otros tipos de errores
        errorMessage = responseData.detail || 
          responseData.message || 
          responseData.error || 
          `Error al registrar usuario (${response.status})`;
      }
      
      throw new Error(errorMessage);
    }
  
    // Procesar respuesta exitosa
    log('Registro exitoso:', responseData);
    
    // Construir y retornar inmediatamente la respuesta de registro
    return {
      user_id: responseData.user_id || 0,
      username: responseData.username || '',
      status: responseData.status || 'basic',
      department: responseData.department || '',
      success: true,
      message: responseData.message || 'Usuario registrado exitosamente'
    };
  } catch (error) {
    // Capturar y registrar el error
    log('Error en la operación de registro:', error);
    console.error('Error completo de registro:', error);
    
    if (error instanceof Error) {
      // Errores de red específicos
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Error de conexión con el servidor. Verifique su conexión a internet');
      }
      
      // Errores de validación
      if (error.message.includes('campos requeridos')) {
        throw new Error('Por favor complete todos los campos requeridos');
      }
      
      // Error de autenticación
      if (error.message.includes('token') || error.message.includes('autenticación')) {
        throw new Error('Error de autenticación. Por favor, inicie sesión nuevamente como administrador.');
      }
      
      // Error de permisos
      if (error.message.includes('permisos') || error.message.includes('authorization') || 
          error.message.includes('autorización') || error.message.includes('401') || error.message.includes('403')) {
        throw new Error('No tiene permisos para registrar usuarios. Verifique su sesión.');
      }
      
      // Error de timeout
      if (error.name === 'AbortError') {
        throw new Error('No se pudo conectar con el servidor. Por favor, verifique su conexión a internet y que el servidor esté activo.');
      }
      
      // Error de CORS
      if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
        throw new Error('Error de acceso al servidor. Problema de configuración CORS. Contacte al administrador.');
      }
      
      // Error de red o servidor no disponible
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError') || 
          error.message.includes('network') ||
          error.message.includes('connection refused')) {
        throw new Error('No se pudo conectar con el servidor. Verifique su conexión e intente nuevamente.');
      }
      
      // PRIORIZAR VALIDACIÓN DE EMAIL - Verificar primero si hay error de email duplicado
      if (error.message.includes('email') || 
          error.message.includes('correo') || 
          error.message.includes('e-mail')) {
        if (error.message.toLowerCase().includes('already exists') || 
            error.message.toLowerCase().includes('ya existe') ||
            error.message.toLowerCase().includes('user with this email')) {
          throw new Error('El correo electrónico ya está registrado en el sistema. Por favor:\n' +
                         '• Si esta cuenta le pertenece, utilice la opción "Olvidé mi contraseña" en la página de inicio de sesión\n' + 
                         '• Si necesita crear una cuenta nueva, utilice un correo electrónico diferente');
        }
        throw new Error('El formato del correo electrónico no es válido. Por favor, ingrese un correo válido.');
      }
      
      
      // Errores específicos de registro
      if (error.message.includes('ya existe') || 
          error.message.includes('already exists') || 
          error.message.includes('user with this') || 
          error.message.includes('usuario con este')) {
        
        if (error.message.toLowerCase().includes('cedula') || 
            error.message.toLowerCase().includes('cédula')) {
          throw new Error('La cédula ya está registrada en el sistema. Por favor, use otra cédula.');
        }
        
        // Esta validación ya se realiza antes en el bloque prioritario de email
        // Mantener la validación como respaldo por si acaso no se detectó en el bloque anterior
        if (error.message.toLowerCase().includes('email') || 
            error.message.toLowerCase().includes('correo') || 
            error.message.toLowerCase().includes('e-mail')) {
          throw new Error('El correo electrónico ya está registrado en el sistema. Por favor, use otro correo o solicite recuperar su contraseña.');
        }
        
        if (error.message.toLowerCase().includes('username') || 
            error.message.toLowerCase().includes('nombre de usuario') ||
            error.message.toLowerCase().includes('user_')) {
          throw new Error('El nombre de usuario ya está registrado en el sistema. Por favor, elija otro nombre de usuario.');
        }
        
        throw new Error('Ya existe un usuario con estos datos en el sistema. Por favor, verifique la información proporcionada.');
      }
      
      if (error.message.includes('departamento no válido') || error.message.includes('department')) {
        throw new Error('El departamento seleccionado no es válido.');
      }
      
      if (error.message.includes('confirm_password') || error.message.includes('contraseña')) {
        throw new Error('Las contraseñas no coinciden. Asegúrese de que ambas contraseñas sean exactamente iguales, sin espacios adicionales al inicio o al final.');
      }
      
      if (error.message.includes('cedula')) {
        throw new Error('La cédula no es válida. Debe tener entre 8 y 10 dígitos.');
      }
      
      // Otro error con mensaje descriptivo, relanzarlo
      throw new Error(`Error de registro: ${error.message}`);
    }
    
    // Error genérico sin mensaje específico
    log('Error inesperado durante el registro', error);
    throw new Error('Error inesperado durante el registro. Intente nuevamente.');
  }
};

