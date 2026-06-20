import { Router } from 'express';
import { 
  register, 
  login, 
  refresh, 
  validate, 
  getAllUsers, 
  getUserById,
  getUserStats,
  approveStudent,
  updateUser
} from '../controllers/auth.controller';
import prisma from '../config/database';

const router = Router();

// Authentification
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/validate', validate);

// Gestion des utilisateurs
router.get('/users', getAllUsers); // Avec recherche, tri, pagination
router.get('/users/stats', getUserStats); // Statistiques
router.get('/users/:userId', getUserById); // Détails d'un utilisateur
router.put('/users/:userId', updateUser); // Mettre à jour un utilisateur (actif/inactif, rôle)
router.post('/users/:userId/approve', approveStudent); // Approuver un étudiant

// Endpoint de test pour vérifier les utilisateurs en base
router.get('/users/debug/all', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json({ count: users.length, users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
