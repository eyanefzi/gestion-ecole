import { Request, Response } from 'express';
import { KeycloakService } from '../services/keycloak.service';
import { StudentService } from '../services/student.service';
import prisma from '../config/database';

const keycloakService = new KeycloakService();
const studentService = new StudentService();

function extractRoleFromToken(token: string): string {
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
    const realmRoles: string[] = decoded?.realm_access?.roles || [];
    if (realmRoles.includes('ADMIN')) return 'ADMIN';
    if (realmRoles.includes('TUTOR')) return 'TUTOR';
    if (realmRoles.includes('STUDENT')) return 'STUDENT';
    return '';
  } catch {
    return '';
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password, firstName, lastName } = req.body;

    console.log('Registration request received for:', username);

    // Créer l'utilisateur dans Keycloak
    const keycloakUser = await keycloakService.createUser({
      email,
      username,
      password,
      firstName,
      lastName,
    });

    console.log('User created in Keycloak with ID:', keycloakUser.id);

    // Créer l'utilisateur dans notre base de données
    const user = await prisma.user.create({
      data: {
        email,
        username,
        keycloakId: keycloakUser.id,
        firstName,
        lastName,
      },
    });

    console.log('User created in database with ID:', user.id);

    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error: any) {
    console.error('Registration error:', error.message);
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Authentifier avec Keycloak
    const tokens = await keycloakService.login(username, password);

    // Récupérer les infos utilisateur depuis Keycloak
    const keycloakUser = await keycloakService.getUserInfo(tokens.accessToken);

    // Extraire le rôle depuis le token JWT Keycloak
    let role = extractRoleFromToken(tokens.accessToken);
    console.log('Extracted role from JWT:', role);

    // Si le JWT ne contient pas de rôle reconnu, utiliser l'API Admin Keycloak
    if (!role) {
      console.log('Role not found in JWT, fetching from Keycloak Admin API...');
      try {
        const realmRoles = await keycloakService.getUserRealmRoles(keycloakUser.sub);
        console.log('Realm roles from Admin API:', realmRoles);
        if (realmRoles.includes('ADMIN')) role = 'ADMIN';
        else if (realmRoles.includes('TUTOR')) role = 'TUTOR';
        else role = 'STUDENT';
      } catch (err) {
        console.error('Failed to fetch roles from Admin API, defaulting to STUDENT');
        role = 'STUDENT';
      }
    }

    // Chercher ou créer l'utilisateur dans notre base
    let user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      // Si l'utilisateur n'existe pas, le créer avec le rôle Keycloak
      console.log('Creating new user with role:', role);
      user = await prisma.user.create({
        data: {
          username,
          email: keycloakUser.email || `${username}@englishflow.com`,
          keycloakId: keycloakUser.sub,
          firstName: keycloakUser.given_name,
          lastName: keycloakUser.family_name,
          role,
        },
      });
    } else if (!user.keycloakId) {
      // Mettre à jour le keycloakId si nécessaire
      console.log('Updating keycloakId for existing user');
      user = await prisma.user.update({
        where: { id: user.id },
        data: { keycloakId: keycloakUser.sub },
      });
    } else if (user.role !== role) {
      // Synchroniser le rôle depuis Keycloak
      console.log('Syncing role from', user.role, 'to', role);
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role },
      });
    }

    // Retourner les tokens et les infos utilisateur
    res.json({
      ...tokens,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    const tokens = await keycloakService.refreshToken(refreshToken);

    res.json(tokens);
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const validate = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const isValid = await keycloakService.validateToken(token);

    res.json({ valid: isValid });
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { 
      search, 
      role, 
      isActive, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      page,
      limit
    } = req.query;

    // Construire les conditions de filtrage
    const where: any = {};

    // Recherche par nom, email ou username
    if (search && typeof search === 'string') {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtre par rôle
    if (role && typeof role === 'string') {
      where.role = role;
    }

    // Filtre par statut actif/inactif
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Tri
    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder === 'asc' ? 'asc' : 'desc';

    // Si pagination demandée
    if (page && limit) {
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            keycloakId: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy,
          skip,
          take: limitNum,
        }),
        prisma.user.count({ where }),
      ]);

      return res.json({
        users,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    }

    // Sans pagination (rétrocompatibilité)
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        keycloakId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy,
    });

    res.json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        keycloakId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      studentCount,
      tutorCount,
      adminCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'TUTOR' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
    ]);

    res.json({
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      byRole: {
        STUDENT: studentCount,
        TUTOR: tutorCount,
        ADMIN: adminCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
};

export const approveStudent = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Vérifier si l'étudiant existe déjà dans le student-service
    try {
      const existingStudents = await studentService.getStudentByEmail(user.email);
      if (existingStudents) {
        return res.status(400).json({ error: 'Student already approved' });
      }
    } catch (checkError) {
      // L'étudiant n'existe pas, on peut continuer
    }

    // Créer le profil étudiant dans le student-service
    try {
      await studentService.createStudent({
        email: user.email,
        firstName: user.firstName || user.username || 'Unknown',
        lastName: user.lastName || 'User',
      });

      res.json({ message: 'Student approved successfully' });
    } catch (studentError: any) {
      console.error('Failed to create student profile:', studentError);
      
      // Vérifier si c'est une erreur de duplication
      if (studentError.response?.status === 409 || studentError.message?.includes('duplicate')) {
        return res.status(400).json({ error: 'Student already exists' });
      }
      
      res.status(500).json({ error: 'Failed to create student profile: ' + studentError.message });
    }
  } catch (error: any) {
    console.error('Error approving student:', error);
    res.status(500).json({ error: 'Failed to approve student: ' + error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { isActive, role } = req.body;

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Mettre à jour dans PostgreSQL
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(role && { role }),
      },
    });

    // Mettre à jour dans Keycloak si nécessaire
    if (user.keycloakId && isActive !== undefined) {
      try {
        await keycloakService.updateUserStatus(user.keycloakId, isActive);
      } catch (keycloakError) {
        console.error('Failed to update user in Keycloak:', keycloakError);
      }
    }

    res.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      },
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user: ' + error.message });
  }
};
