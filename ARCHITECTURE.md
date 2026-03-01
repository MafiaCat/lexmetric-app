# LexMetric - Architecture Technique

## 1. Arborescence du Projet

```text
lexmetric/
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # Point d'entrée FastAPI
│   │   ├── api/
│   │   │   ├── endpoints/       # Routes (ex: lawyers.py)
│   │   │   └── dependencies.py  # Injections de dépendances (DB session, Auth)
│   │   ├── core/
│   │   │   ├── config.py        # Variables d'environnement
│   │   │   ├── security.py      # JWT, Hachage des mots de passe
│   │   │   └── scoring.py       # Algorithme de Matching/Scoring
│   │   ├── db/
│   │   │   ├── database.py      # Configuration SQLAlchemy
│   │   │   └── models.py        # Modèles ORM (SQLAlchemy)
│   │   └── schemas/
│   │       └── schemas.py       # Modèles Pydantic (Validation & Sérialisation)
│   └── tests/
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── components/          # Composants UI réutilisables
│       ├── features/            # Domaines métiers (ex: search, dashboard)
│       ├── hooks/               # Custom React hooks
│       ├── services/            # Appels API (Axios/Fetch)
│       ├── types/               # Interfaces TypeScript
│       └── App.tsx
└── docker-compose.yml           # Orchestration des conteneurs
```

## 2. Schéma de Base de Données (UML)

```mermaid
erDiagram
    User {
        int id PK
        string email
        string hashed_password
        string role "Admin, Manager"
        string full_name
        datetime created_at
    }
    
    LawFirm {
        int id PK
        string name
        int size "Nombre d'associés/collab"
        string contact_email
        datetime created_at
    }
    
    Lawyer {
        int id PK
        int law_firm_id FK
        string first_name
        string last_name
        string bar_association
        date oath_date
        string specialties "Tableau de spécialités"
        boolean in_network "Appartenance au réseau"
        float average_hourly_rate
        datetime created_at
    }
    
    CaseType {
        int id PK
        string name "Ex: Préjudice Corporel"
        string category
    }
    
    Mission {
        int id PK
        int lawyer_id FK
        int user_id FK "Gestionnaire d'assurance"
        int case_type_id FK
        string status "En cours, Clôturé"
        float financial_stakes "Enjeu financier"
        float total_cost
        datetime start_date
        datetime end_date
    }
    
    Review {
        int id PK
        int mission_id FK
        int reviewer_id FK
        int reactivity_score "1-5"
        int technical_expertise_score "1-5"
        int negotiation_score "1-5"
        int fee_respect_score "1-5"
        string comment
        datetime created_at
    }
    
    LawFirm ||--o{ Lawyer : "emploie"
    Lawyer ||--o{ Mission : "gère"
    User ||--o{ Mission : "assigne"
    CaseType ||--o{ Mission : "catégorise"
    Mission ||--o| Review : "est évaluée par"
    User ||--o{ Review : "rédige"
```
