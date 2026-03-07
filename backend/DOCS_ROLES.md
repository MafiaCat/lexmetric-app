# Documentation des Rôles et de la Sécurité (LexMetric)

Cette documentation détaille le modèle de permissions et de sécurité utilisé dans l'API LexMetric.

## Modèle d'Authentification

L'authentification est gérée par des tokens JWT.
Pour le MVP et les besoins de développement rapide, le système utilise un mécanisme de headers injectés par le frontend via un interceptor Axios :
- `x-user-id` : ID de l'utilisateur connecté.
- `x-user-role` : Rôle de l'utilisateur (`user` ou `admin`).
- `x-company-id` : ID de l'entreprise associée.

## Rôles Utilisateurs

### 1. Gestionnaire (Rôle: `user`)
Le rôle par défaut pour les clients (cabinets d'avocats ou entreprises).
- **Accès** : `UserApp.tsx`
- **Permissions** : 
  - Rechercher des avocats.
  - Soumettre des avis sur des missions terminées.
  - Créer et gérer ses propres tickets de support.
  - Consulter son propre dashboard analytique.

### 2. Modérateur (Rôle: `admin`)
Le rôle privilégié pour l'équipe interne de LexMetric.
- **Accès** : `ModeratorApp.tsx`
- **Permissions** :
  - **KPIs** : Accès aux statistiques globales de la plateforme.
  - **Avocats** : Validation des profils en attente, édition des fiches existantes, importation CSV.
  - **Utilisateurs** : Liste complète des comptes, changement de rôle (promotion/dépromotion), impersonation.
  - **Avis** : Modération stricte (suppression d'avis abusifs).
  - **Tickets** : Support complet (réponse, classification, changement de statut).
  - **Sécurité** : Consultation des `AuditLogs`.

## Sécurisation de l'API (Backend)

Toutes les routes sensibles du backend sont protégées par des dépendances FastAPI :

### `verify_admin`
- **Fonctionnement** : Vérifie la présence et la valeur du header `x-user-role`.
- **Action** : Lève une `HTTPException(403)` si l'utilisateur n'est pas `admin`.
- **Routes protégées** :
  - `/api/admin/*`
  - `/api/moderation/*`

## Traçabilité (Audit Log)

Les actions critiques effectuées par les modérateurs sont enregistrées dans la table `AuditLog` :
- `user_id` : Qui a fait l'action.
- `action` : Type d'opération (`DELETE_REVIEW`, `UPDATE_USER_ROLE`, etc.).
- `target_resource` : Description de l'objet impacté.
- `created_at` : Timestamp précis.
