// Type definitions for authentication
type UserStatus = "basic" | "admin" | "superAdmin";

// User information interface
interface UserInfo {
  userId: number;
  username: string;
  status: UserStatus;
  department: string;
  departmentDisplay: string;
}

// Authentication response from API
interface AuthResponse {
  user_id: number;
  username: string;
  token: string;
  status: UserStatus;
  department: string;
  department_display: string;
}

// Response type from the login endpoint
interface LoginResponse {
  success: boolean;
  data?: AuthResponse;
  error?: string;
}

// Base API URL - consider using environment variables
const API_BASE_URL = "http://127.0.0.1:8000"; // Using IP address without API prefix

/**
 * Authentication utility object with methods for managing user authentication
 */
export const auth = {
  /**
   * Sets authentication cookies for server-side validation
   */
  setAuthCookies(data: AuthResponse): void {
    // Set cookies with httpOnly flag
    document.cookie = `authToken=${data.token}; path=/; secure; samesite=strict`;
    document.cookie = `userStatus=${data.status}; path=/; secure; samesite=strict`;
  },

  /**
   * Clears authentication cookies
   */
  clearAuthCookies(): void {
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'userStatus=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  },

  /**
   * Stores authentication data in localStorage and cookies
   */
  setSession(data: AuthResponse): void {
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("userId", String(data.user_id));
    localStorage.setItem("username", data.username);
    localStorage.setItem("userStatus", data.status);
    localStorage.setItem("userDepartment", data.department);
    localStorage.setItem("userDepartmentDisplay", data.department_display);
    
    // Add cookie management
    this.setAuthCookies(data);
  },

  /**
   * Retrieves user information from localStorage
   */
  getUserInfo(): UserInfo | null {
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    const status = localStorage.getItem("userStatus") as UserStatus | null;
    const department = localStorage.getItem("userDepartment");
    const departmentDisplay = localStorage.getItem("userDepartmentDisplay");

    if (!userId || !username || !status || !department) {
      return null;
    }

    return {
      userId: parseInt(userId, 10),
      username,
      status,
      department,
      departmentDisplay: departmentDisplay || department,
    };
  },

  /**
   * Retrieves the authentication token
   */
  getToken(): string | null {
    return localStorage.getItem("authToken");
  },

  /**
   * Checks if the user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const userInfo = this.getUserInfo();
    
    // Check both token and user info are present and valid
    return !!(token && userInfo && userInfo.status && userInfo.department);
  },

  /**
   * Checks if user has admin privileges
   */
  isAdmin(): boolean {
    const userInfo = this.getUserInfo();
    return userInfo?.status === "admin" || userInfo?.status === "superAdmin";
  },

  /**
   * Checks if user is a super admin
   */
  isSuperAdmin(): boolean {
    const userInfo = this.getUserInfo();
    return userInfo?.status === "superAdmin";
  },

  /**
   * Gets the appropriate dashboard path based on user role
   */
  getDashboardPath(): string {
    return this.isAdmin() ? "/dashboard/oac/admin" : "/dashboard/oac";
  },

  /**
   * Clears the authentication session
   */
  clearSession(): void {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("userStatus");
    localStorage.removeItem("userDepartment");
    localStorage.removeItem("userDepartmentDisplay");
    
    // Add cookie cleanup
    this.clearAuthCookies();
  },

  /**
   * Logs the user in
   */
  async login(credentials: {
    cedula: string;
    password: string;
  }): Promise<AuthResponse> {
    const csrfToken = getCsrfToken();
    console.log('Attempting login with credentials:', { cedula: credentials.cedula }); // Don't log password
    console.log('CSRF Token:', csrfToken ? 'Present' : 'Not found');

    try {
      console.log('Attempting login with:', { cedula: credentials.cedula });
      
      const response = await fetch(`${API_BASE_URL}/api/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      }).catch(error => {
        console.error('Fetch error:', error);
        throw new Error('Error de conexión: El servidor no está disponible. Por favor, verifique que el servidor backend esté en funcionamiento.');
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      // Handle unsuccessful responses
      if (!response.ok) {
        // Clear any existing session
        this.clearSession();
        
        console.log('Response not OK, status:', response.status);
        
        // Handle specific error cases
        if (response.status === 401 || response.status === 400) {
          throw new Error("Credenciales inválidas. Por favor, intente de nuevo.");
        } else if (response.status === 403) {
          throw new Error("Acceso denegado. Contacte al administrador.");
        } else {
          throw new Error("Error en el servidor. Por favor, intente más tarde.");
        }
      }

      // Validate the response data
      if (!data.token || !data.user_id || !data.status || !data.department) {
        this.clearSession();
        throw new Error("Respuesta del servidor inválida");
      }

      // Convert the response to match our AuthResponse type
      const authResponse: AuthResponse = {
        user_id: data.user_id,
        username: data.username,
        token: data.token,
        status: data.status as UserStatus,
        department: data.department,
        department_display: data.department_display
      };

      // Validate user status
      if (!["basic", "admin", "superAdmin"].includes(authResponse.status)) {
        this.clearSession();
        throw new Error("Estado de usuario inválido");
      }

      // Store session data
      this.setSession(authResponse);
      return authResponse;
    } catch (error) {
      // Clear any existing session on error
      this.clearSession();
      
      console.error('Login error:', error);
      
      // Check for network errors
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('No se puede conectar al servidor. Verifique que:\n1. El servidor backend esté en funcionamiento\n2. La URL del servidor sea correcta (http://127.0.0.1:8000)\n3. No haya problemas de red o firewall');
      }

      if (error instanceof Error) {
        if (error.message.includes('NetworkError')) {
          throw new Error('Error de red. Verifique su conexión a internet.');
        }
        if (error.message.includes('CORS')) {
          throw new Error('Error de acceso al servidor. Verifique la configuración CORS del backend.');
        }
      }
      
      // Re-throw the error for handling in the component
      throw error;
    }
  },

  /**
   * Logs the user out
   */
  async logout(): Promise<void> {
    const token = this.getToken();
    const csrfToken = getCsrfToken();

    if (token) {
      try {
        await fetch(`${API_BASE_URL}/api/logout/`, {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
            ...(csrfToken && { "X-CSRFToken": csrfToken }),
          },
          credentials: "include",
        });
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        this.clearSession();
      }
    }
  },

  /**
   * Checks if the backend server is available
   */
  async checkConnection(): Promise<boolean> {
    try {
      // Try to fetch a health endpoint, or if not available, 
      // try to make a simple HEAD request to the API root
      const response = await fetch(`${API_BASE_URL}/api/health/`, {
        method: 'GET',
      }).catch(async () => {
        // If health endpoint fails, try the login endpoint with OPTIONS
        return await fetch(`${API_BASE_URL}/api/login/`, {
          method: 'OPTIONS',
        });
      });
      
      return response.ok;
    } catch (error) {
      console.error('Connection check failed:', error);
      return false;
    }
  }
};

/**
 * Makes an authenticated API request
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = auth.getToken();
  const csrfToken = getCsrfToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Token ${token}` }),
    ...(csrfToken && { "X-CSRFToken": csrfToken }),
    ...(options.headers || {}),
  };

  // Ensure endpoint starts with /api/
  const normalizedEndpoint = endpoint.startsWith('/api/') 
    ? endpoint 
    : `/api/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;

  const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Unauthorized - token expired or invalid
      auth.clearSession();
      window.location.href = "/";
      throw new Error("Sesión expirada");
    }

    try {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || errorData.message || "Error en la solicitud"
      );
    } catch (e) {
      throw new Error("Error en el servidor");
    }
  }

  return await response.json();
}

/**
 * Helper function to get CSRF token from cookies
 */
function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : null;
}
