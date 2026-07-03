## services / API
Immich (photos)
Paperless-ngx (documents)
Grafana (monitoring)
Prometheus
n8n (automatisation)
Meilisearch (recherche)
ntfy (alertes push)
Hetzner Storage Box (sauvegarde)

## UI pour : 
1. Gestion du Stockage et du Cycle de Vie — Stockage centralisé avec versioning (Git), archivage progressif, et destruction automatisée selon les politiques de  rétention
2. Indexation et Recherche Full-Text — Moteur de recherche rapide avec indexation des métadonnées et contenu : Meilisearch
3. Classification et Organisation — Plan de classification hiérarchique, taxonomies, tags, et gestion de la structure documentaire
4. Gestion des Droits d'Accès — Authentification, autorisation granulaire (ACL), audit des accès
5. Capture et Enrichissement de Métadonnées — Extraction automatique, extraction OCR, enrichissement de propriétés
6. Conversion et Transformation de Formats — Conversion de fichiers, génération de previews, extraction de contenu structuré, Whisper pour traduire du l'audio en texte
7. Collaboration et Annotations — Partage, permissions temporaires, commentaires, versions collaboratives
    
## Swagger / API docs locaux (sur le NAS)

  ┌────────────────────┬────────────────────────────────────────┬─────────────────────────────────────────────────────────┐
  │      Service       │               URL locale               │                          Type                           │
  ├────────────────────┼────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
  │ Immich 2283        │ http://100.113.214.55:2283/api         │ OpenAPI / Swagger UI intégré                            │
  ├────────────────────┼────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
  │ Paperless-ngx 8010 │ http://100.113.214.55:8010/api/        │ DRF browsable API                                       │
  ├────────────────────┼────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
  │                    │ http://100.113.214.55:8010/api/schema/ │ OpenAPI YAML brut                                       │
  ├────────────────────┼────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
  │                    │ http://100.113.214.55:8010/api/docs/   │ Redoc                                                   │
  ├────────────────────┼────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
  │ n8n 5679           │ http://100.113.214.55:5679/api/v1/docs │ Swagger UI intégré                                      │
  ├────────────────────┼────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
  │ Meilisearch 7700   │ http://100.113.214.55:7700             │ Interface Meilisearch (pas de Swagger — REST classique) │
  └────────────────────┴────────────────────────────────────────┴─────────────────────────────────────────────────────────┘