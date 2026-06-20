import axios from 'axios';

export class KeycloakService {
  private baseUrl: string;
  private realm: string;
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.baseUrl = process.env.KEYCLOAK_URL || 'http://localhost:8080';
    this.realm = process.env.KEYCLOAK_REALM || 'microservices';
    this.clientId = process.env.KEYCLOAK_CLIENT_ID || 'auth-service';
    this.clientSecret = process.env.KEYCLOAK_CLIENT_SECRET || '';
  }

  async createUser(userData: any) {
    try {
      console.log('Creating user in Keycloak...');
      console.log('Keycloak URL:', this.baseUrl);
      console.log('Realm:', this.realm);
      
      // Obtenir un token admin depuis le realm microservices
      const adminToken = await this.getAdminToken();
      console.log('Admin token obtained successfully');

      const keycloakUrl = `${this.baseUrl}/admin/realms/${this.realm}/users`;
      console.log('Creating user at:', keycloakUrl);

      const response = await axios.post(
        keycloakUrl,
        {
          username: userData.username,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          enabled: true,
          emailVerified: true,
          credentials: [
            {
              type: 'password',
              value: userData.password,
              temporary: false,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('User created in Keycloak, status:', response.status);

      // Extraire l'ID utilisateur de l'URL de location
      const locationHeader = response.headers.location || response.headers.Location;
      const userId = locationHeader?.split('/').pop();
      
      console.log('Keycloak user ID:', userId);
      return { id: userId };
    } catch (error: any) {
      console.error('Keycloak createUser error details:');
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Message:', error.message);
      throw new Error(error.response?.data?.errorMessage || error.message || 'Failed to create user in Keycloak');
    }
  }

  async login(username: string, password: string) {
    const response = await axios.post(
      `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'password',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        username,
        password,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
    };
  }

  async getUserInfo(accessToken: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Keycloak userinfo error:', error.response?.data || error.message);
      // Si l'appel échoue, décoder le JWT directement
      return this.decodeToken(accessToken);
    }
  }

  // Décoder le JWT pour extraire les infos utilisateur
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        Buffer.from(base64, 'base64')
          .toString('utf-8')
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const decoded = JSON.parse(jsonPayload);
      
      return {
        sub: decoded.sub,
        email: decoded.email,
        preferred_username: decoded.preferred_username,
        given_name: decoded.given_name,
        family_name: decoded.family_name,
        name: decoded.name,
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      throw new Error('Failed to decode token');
    }
  }

  async refreshToken(refreshToken: string) {
    const response = await axios.post(
      `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
    };
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      await axios.post(
        `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token/introspect`,
        new URLSearchParams({
          token,
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      return true;
    } catch {
      return false;
    }
  }

  private async getAdminToken(): Promise<string> {
    try {
      // Essayer avec le realm master (admin-cli) - fiable, accès complet
      const response = await axios.post(
        `${this.baseUrl}/realms/master/protocol/openid-connect/token`,
        new URLSearchParams({
          grant_type: 'password',
          client_id: 'admin-cli',
          username: process.env.KEYCLOAK_ADMIN_USERNAME || 'admin',
          password: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      return response.data.access_token;
    } catch (masterError: any) {
      console.error('Failed to get admin token from master realm:', masterError.response?.data || masterError.message);
      
      // Fallback: essayer avec le client actuel
      try {
        const response = await axios.post(
          `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`,
          new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: this.clientId,
            client_secret: this.clientSecret,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        return response.data.access_token;
      } catch (error: any) {
        console.error('Failed to get admin token with client_credentials:', error.response?.data || error.message);
        throw new Error('Unable to obtain admin token.');
      }
    }
  }

  async getUserRealmRoles(keycloakId: string): Promise<string[]> {
    try {
      const adminToken = await this.getAdminToken();
      const response = await axios.get(
        `${this.baseUrl}/admin/realms/${this.realm}/users/${keycloakId}/role-mappings/realm`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      return (response.data as any[]).map((r: any) => r.name);
    } catch (error: any) {
      console.error('Failed to get user realm roles:', error.response?.data || error.message);
      return [];
    }
  }

  async updateUserStatus(keycloakId: string, isActive: boolean): Promise<void> {
    try {
      const adminToken = await this.getAdminToken();
      
      await axios.put(
        `${this.baseUrl}/admin/realms/${this.realm}/users/${keycloakId}`,
        {
          enabled: isActive,
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error: any) {
      console.error('Failed to update user status in Keycloak:', error.response?.data || error.message);
      throw new Error('Failed to update user status in Keycloak');
    }
  }
}
