import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export enum UserRole {
  ADMIN = 'ADMIN',
  TUTOR = 'TUTOR',
  STUDENT = 'STUDENT'
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private router: Router) {}

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  // Obtenir le rôle de l'utilisateur
  getUserRole(): UserRole | null {
    const role = localStorage.getItem('user_role');
    return role as UserRole || null;
  }

  // Obtenir les informations de l'utilisateur
  getUserInfo() {
    return {
      username: localStorage.getItem('username') || '',
      email: localStorage.getItem('user_email') || '',
      firstName: localStorage.getItem('user_firstname') || '',
      lastName: localStorage.getItem('user_lastname') || '',
      role: this.getUserRole()
    };
  }

  // Vérifications de rôle
  isAdmin(): boolean {
    return this.getUserRole() === UserRole.ADMIN;
  }

  isTutor(): boolean {
    return this.getUserRole() === UserRole.TUTOR;
  }

  isStudent(): boolean {
    return this.getUserRole() === UserRole.STUDENT;
  }

  isTutorOrAdmin(): boolean {
    return this.isAdmin() || this.isTutor();
  }

  // Permissions spécifiques
  canManageUsers(): boolean {
    return this.isAdmin();
  }

  canManageCourses(): boolean {
    return this.isTutor();
  }

  canManageStudents(): boolean {
    return false;
  }

  canManageEnrollments(): boolean {
    return false;
  }

  canCreateQuiz(): boolean {
    return this.isTutor();
  }

  canTakeQuiz(): boolean {
    return this.isStudent();
  }

  // Déconnexion
  logout(): void {
    localStorage.clear();
    this.router.navigate(['/']);
  }

  // Obtenir le message de bienvenue selon le rôle
  getWelcomeMessage(): string {
    const firstName = localStorage.getItem('user_firstname') || localStorage.getItem('username');
    const role = this.getUserRole();
    
    switch(role) {
      case UserRole.ADMIN:
        return `Bienvenue Administrateur ${firstName}`;
      case UserRole.TUTOR:
        return `Bienvenue Tuteur ${firstName}`;
      case UserRole.STUDENT:
        return `Bienvenue ${firstName}`;
      default:
        return `Bienvenue ${firstName}`;
    }
  }

  // Obtenir les fonctionnalités disponibles selon le rôle
  getAvailableFeatures(): string[] {
    const role = this.getUserRole();
    
    switch(role) {
      case UserRole.ADMIN:
        return [
          'Gérer tous les utilisateurs',
          'Gérer tous les cours',
          'Gérer tous les étudiants',
          'Voir toutes les inscriptions',
          'Créer et gérer les quiz'
        ];
      case UserRole.TUTOR:
        return [
          'Gérer les cours',
          'Voir les étudiants',
          'Gérer les inscriptions',
          'Créer des quiz'
        ];
      case UserRole.STUDENT:
        return [
          'Voir mes cours',
          'Passer des quiz',

          'Voir mon profil'
        ];
      default:
        return [];
    }
  }
}
