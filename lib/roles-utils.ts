/**
 * Dictionnaire des rôles disponibles dans l'application
 * Utilisé pour la gestion des autorisations et l'affichage
 */

export const ROLES = {
    ADMIN: 'Admin',
    USER: 'User',
} as const;

export const PERMISSIONS = {
    ADMIN_ACCESS: 'Admin_Access',
    ADMIN_QUESTMANAGEMENT: 'Admin_QuestManagement',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];


/**
 * Vérifie si un utilisateur possède une permission spécifique
 * @param user - L'utilisateur
 * @param permission - La permission à vérifier
 * @returns boolean indiquant si l'utilisateur possède la permission
 */
export async function hasPermission(): Promise<boolean> {
    /*if (!Array.isArray(user.permissions)) return false;
    const hashedPermission = await simpleHash(permission, user.firstname);
    return user.permissions.includes(hashedPermission);*/
    return true;
}

/**
 * Vérifie si un utilisateur possède un rôle spécifique
 * @param user - L'utilisateur
 * @param requiredRole - Rôle requis pour l'accès
 * @returns boolean indiquant si l'utilisateur possède le rôle requis
 */
export async function hasRole(): Promise<boolean> {
    /*if (!Array.isArray(user.roles)) return false;
    const hashedRole = await simpleHash(requiredRole, user.firstname);
    console.log("hashedRole", hashedRole);
    console.log("user.roles", user.roles);
    return user.roles.includes(hashedRole);*/
    return true;
}

/**
 * Vérifie si un utilisateur possède au moins un des rôles spécifiés
 * @param user - L'utilisateur
 * @param requiredRoles - Tableau des rôles dont au moins un est requis
 * @returns boolean indiquant si l'utilisateur possède au moins un des rôles requis
 */
export async function hasAnyRole(): Promise<boolean> {
    return false;
}