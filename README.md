# TrekQuest Nepal

A full-stack web application for discovering and planning treks in Nepal. Browse 51 treks with rich details, filter by grade/region/budget/duration, view interactive route maps, check live weather, and get AI-powered personalised recommendations.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, React-Leaflet |
| Backend | Django 5.1, Django REST Framework 3.15 |
| Database | PostgreSQL |
| Auth | JWT (Simple JWT + Djoser) |
| AI | Claude Haiku (Anthropic API) |
| Maps | Leaflet + CartoDB Dark Matter tiles |
| Weather | Open-Meteo API (free) |

---

## Features

### Trek Discovery
- **51 Nepal treks** with descriptions, grades, costs, durations, altitudes, distances, and best travel times
- **Rich trek cards** with grade-coloured difficulty badges and duration badges
- **Slide-in detail drawer** showing full stats, description, interactive map, and live weather

### Filtering & Search
- Search by trek name or region
- Filter by grade (sorted by difficulty), best season, trip duration, distance
- Multi-select region dropdown
- Budget range (min/max) with overlap-based matching
- All filters run against the backend via `django-filter`

### Interactive Maps
- Per-trek route map in the drawer using React-Leaflet
- CartoDB Dark Matter tiles (no API key, matches dark theme)
- GeoJSON route polyline for all 51 treks (seeded waypoints)
- Location marker with trek name popup

### Weather Widget
- Live current conditions and 7-day forecast per trek
- Powered by Open-Meteo using each trek's coordinates
- WMO weather code → emoji + label mapping

### AI Recommendations
- Dedicated `/recommend` page (logged-in users only)
- Select fitness level, trip length, budget, and interests via chips + optional free text
- Claude Haiku matches preferences against the full trek catalogue
- Returns 3 ranked suggestions with personalised reasoning
- Rate limited to 3 requests/day per user (unlimited for admins)
- "View Trek →" opens the full trek drawer inline on the same page

### User Accounts
- Register / login with JWT authentication
- User profile with trekking experience and fitness level
- Save favourite treks

### Admin Panel
- View total users, treks, and favourites
- See recently joined users

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/treks/` | List treks (supports filtering + search) | Public |
| GET | `/api/treks/<id>/` | Trek detail | Public |
| POST | `/api/recommendations/` | AI trek recommendations | Required |
| GET | `/api/user/profile/` | Current user profile | Required |
| PATCH | `/api/user/profile/update/` | Update profile | Required |
| GET/POST | `/api/user/favorites/` | List / add favourites | Required |
| DELETE | `/api/user/favorites/<id>/` | Remove favourite | Required |
| GET | `/api/admin/stats/` | Dashboard stats | Admin only |

---

## Getting Started

### Backend
```bash
cd django_backend
source ../venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_trek_data
python manage.py populate_numeric_fields
python manage.py populate_route_geojson
python manage.py runserver
```

### Frontend
```bash
cd react_frontend
npm install
npm start
```

### Environment Variables
Create `django_backend/.env`:
```
DB_NAME=trekquestnepal_db
DB_USER=<your_pg_user>
DB_PASSWORD=<your_pg_password>
DB_HOST=localhost
DB_PORT=5432
ANTHROPIC_API_KEY=<your_key>
```

---

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for full system diagrams covering component hierarchy, database schema, API flow, and the AI recommendation pipeline.

---

## Not Yet Implemented

- Trek featured images
- User reviews and journals
- Itinerary planner
