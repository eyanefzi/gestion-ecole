UPDATE "User" SET role = 'ADMIN' WHERE username = 'admin';
UPDATE "User" SET role = 'TUTOR' WHERE username = 'tutor';
SELECT username, role FROM "User";
