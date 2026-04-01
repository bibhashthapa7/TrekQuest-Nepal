# TrekQuest Nepal — Architecture

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER'S BROWSER                             │
│                                                                     │
│   React 18  ·  React Router v6  ·  React-Leaflet  ·  CSS           │
│   localhost:3000                                                    │
└───────────────────────────┬─────────────────────────────────────────┘
                            │  HTTP / JWT
                            │  (axios + fetch)
┌───────────────────────────▼─────────────────────────────────────────┐
│                       DJANGO BACKEND                                │
│                                                                     │
│   Django 5.1  ·  DRF 3.15  ·  Simple JWT  ·  django-filter         │
│   localhost:8000                                                    │
└──────────┬────────────────────────────────────┬─────────────────────┘
           │  psycopg2                          │  anthropic SDK
           │                                   │
┌──────────▼──────────┐             ┌──────────▼──────────┐
│    PostgreSQL DB     │             │    Claude API        │
│                     │             │  (Haiku model)       │
│  trekquestnepal_db  │             │  api.anthropic.com   │
└─────────────────────┘             └─────────────────────┘

                            External APIs called directly from browser:
                            ┌─────────────────┐  ┌──────────────────┐
                            │   Open-Meteo    │  │  CartoDB Tiles   │
                            │  (weather data) │  │  (map tiles)     │
                            └─────────────────┘  └──────────────────┘
```

---

## 2. Frontend Component Tree

```
App.js  (React Router)
│
├── /                   MainPage.js
├── /auth               Auth.js
├── /treks              Treks.js
│                         ├── Navigation.js
│                         ├── Filter bar
│                         │     ├── SingleSelectDropdown  (Grade, Season, Duration, Distance)
│                         │     └── LocationDropdown      (multi-select regions)
│                         ├── Trek cards grid
│                         └── TrekDrawer.js  ──────────────┐
│                                                           │  shared component
├── /recommend          Recommend.js                       │
│                         ├── Navigation.js                │
│                         ├── Logged-out gate              │
│                         ├── Preference chips form        │
│                         ├── Result cards                 │
│                         └── TrekDrawer.js  ──────────────┘
│
├── /profile            UserProfile.js
│                         └── Navigation.js
│
└── /admin              AdminProfile.js
                          └── Navigation.js

─────────────────────────────────────────────────
TrekDrawer.js  (shared, used by Treks + Recommend)
  ├── Stat grid
  ├── Description
  ├── TrekMap          (React-Leaflet, CartoDB tiles, GeoJSON route polyline)
  └── WeatherWidget    (Open-Meteo API, current + 7-day forecast)
```

---

## 3. Backend Layer Map

```
django_backend/
│
├── django_backend/settings.py      ← config, INSTALLED_APPS, JWT settings
│
└── api/
    ├── models.py                   ← data layer
    │     ├── Trek                  (51 treks, full schema)
    │     ├── UserProfile           (extends Django User)
    │     ├── UserFavorite          (user ↔ trek junction)
    │     └── RecommendationRequest (rate-limit log)
    │
    ├── serializers.py              ← DRF serializers (JSON ↔ model)
    ├── filters.py                  ← TrekFilter (django-filter)
    │
    └── views.py                    ← business logic
          ├── TrekListCreateView    GET/POST  /api/treks/
          ├── TrekDetailView        GET/PUT   /api/treks/<id>/
          ├── UserProfileView       GET       /api/user/profile/
          ├── UserProfileUpdateView PATCH     /api/user/profile/update/
          ├── user_favorites        GET/POST  /api/user/favorites/
          ├── remove_favorite       DELETE    /api/user/favorites/<id>/
          ├── admin_stats           GET       /api/admin/stats/
          └── get_recommendations   POST      /api/recommendations/
```

---

## 4. Database Schema

```
┌─────────────────────────────────┐
│         auth_user  (Django)     │
│─────────────────────────────────│
│  id, username, email, password  │
│  is_staff, is_superuser         │
└────────┬─────────────┬──────────┘
         │             │
         │ 1:1         │ 1:N
         ▼             ▼
┌────────────────┐  ┌──────────────────────┐
│  UserProfile   │  │  RecommendationReq.  │
│────────────────│  │──────────────────────│
│  phone_number  │  │  user_id (FK)        │
│  date_of_birth │  │  created_at          │
│  bio           │  └──────────────────────┘
│  trekking_exp  │
│  fitness_level │
└────────────────┘

┌─────────────────────────────────────────┐
│                  Trek                   │
│─────────────────────────────────────────│
│  id, trek_name, location                │
│  description, featured_image            │
│  trip_grade, best_travel_time           │
│                                         │
│  ── Display fields (text) ──            │
│  cost_range, duration                   │
│  max_altitude, total_distance           │
│                                         │
│  ── Numeric fields (filtering) ──       │
│  cost_min, cost_max                     │
│  duration_days_min, duration_days_max   │
│  altitude_m, distance_km               │
│                                         │
│  ── Geo fields ──                       │
│  coordinates_lat, coordinates_lng       │
│  route_geojson  (JSONField)             │
└──────────────────┬──────────────────────┘
                   │ M:N  (via UserFavorite)
                   ▼
┌──────────────────────────┐
│       UserFavorite       │
│──────────────────────────│
│  user_id (FK)            │
│  trek_id (FK)            │
│  created_at              │
│  UNIQUE(user, trek)      │
└──────────────────────────┘
```

---

## 5. Recommendation Request Flow

```
User submits preferences
        │
        ▼
POST /api/recommendations/
  + Authorization: Bearer <JWT>
        │
        ▼
  ┌─────────────┐
  │ Auth check  │── fail ──► 401 Unauthorized
  └──────┬──────┘
         │ pass
         ▼
  ┌──────────────────┐
  │ Rate limit check │── limit reached ──► 429 (unless admin)
  │  (3/day/user)    │
  └──────┬───────────┘
         │ under limit
         ▼
  ┌───────────────────────┐
  │ Query all 51 treks    │
  │ from PostgreSQL       │
  └──────────┬────────────┘
             │
             ▼
  ┌────────────────────────────────┐
  │ Build prompt                   │
  │  system: trek-only constraint  │
  │  user:   trek catalogue +      │
  │          user preferences      │
  └──────────┬─────────────────────┘
             │
             ▼
  ┌─────────────────────────┐
  │  Claude Haiku API call  │
  │  max_tokens: 1024       │
  └──────────┬──────────────┘
             │
             ▼
  ┌──────────────────┐
  │  Parse JSON      │── parse error ──► 500
  │  response        │
  └──────┬───────────┘
         │ success
         ▼
  Log RecommendationRequest
  Return 3 recommendations
        │
        ▼
  Frontend renders result cards
  User clicks "View Trek →"
        │
        ▼
  GET /api/treks/?search=<name>
  TrekDrawer opens on same page
```

---

## 6. Authentication Flow

```
Login / Register
      │
      ▼
POST /auth/jwt/create/
      │
      ▼
   { access, refresh }  ← stored in localStorage
      │
      ▼
  Every API request:
  Authorization: Bearer <access_token>
      │
      ▼
  Token expired?
      │
      ├── No  ──► request proceeds
      │
      └── Yes ──► POST /api/token/refresh/
                    │
                    ├── success ──► retry with new access token
                    └── fail    ──► redirect to /auth
```

---

## 7. Key Tech Decisions

| Decision | Choice | Reason |
|---|---|---|
| Auth | JWT (Simple JWT + Djoser) | Stateless, works well with SPA |
| Filtering | django-filter | Clean separation from views |
| Map tiles | CartoDB Dark Matter | Free, no API key, matches dark theme |
| Maps | React-Leaflet v4 | Compatible with React 18, open source |
| Weather | Open-Meteo | Free, no API key needed |
| AI model | Claude Haiku | Cheapest/fastest, sufficient for structured lookup |
| Route data | Seeded GeoJSON waypoints | Works for all 51 treks, no OSM parsing complexity |
| Trek data | Dual storage (text + numeric) | Text for display, numeric for accurate filtering |
| Vector DB | Not used | 51 treks is below RAG threshold |
