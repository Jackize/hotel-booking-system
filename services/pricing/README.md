# Pricing Service

This service manages rate plans and pricing for the hotel booking system.

## Features

- Rate Plan management (CRUD operations)
- Price management (CRUD operations)
- Price queries by rate plan and room type
- Integration with Kafka for event-driven architecture
- Redis caching support

## API Endpoints

### Rate Plans
- `POST /pricing/rate-plans` - Create a new rate plan
- `GET /pricing/rate-plans` - Get all active rate plans
- `GET /pricing/rate-plans/:id` - Get a specific rate plan
- `PATCH /pricing/rate-plans/:id` - Update a rate plan
- `DELETE /pricing/rate-plans/:id` - Deactivate a rate plan

### Prices
- `POST /pricing/prices` - Create a new price
- `GET /pricing/prices` - Get all active prices
- `GET /pricing/prices/:id` - Get a specific price
- `GET /pricing/rate-plans/:ratePlanId/prices` - Get prices by rate plan
- `PATCH /pricing/prices/:id` - Update a price
- `DELETE /pricing/prices/:id` - Deactivate a price

## Environment Variables

- `NODE_ENV` - Environment (development, production, test)
- `PORT` - Service port (default: 3004)
- `DB_HOST` - PostgreSQL host string
- `DB_USER` - PostgreSQL user string
- `DB_PASS` - PostgreSQL password string
- `DB_PORT` - PostgreSQL port string
- `DB_NAME` - PostgreSQL name string
- `REDIS_URL` - Redis connection string
- `KAFKA_BROKERS` - Kafka brokers (comma-separated)

## Running the Service

```bash
# Install dependencies
pnpm install

# Development
pnpm start:dev

# Production
pnpm build
pnpm start:prod
```

## Database Schema

### Rate Plans Table
- `id` (UUID, Primary Key)
- `name` (String)
- `description` (Text, nullable)
- `is_active` (Boolean)
- `base_price` (Decimal)
- `currency` (String, default: USD)
- `rules` (JSONB, nullable)
- `valid_from` (Timestamp, nullable)
- `valid_to` (Timestamp, nullable)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Prices Table
- `id` (UUID, Primary Key)
- `rate_plan_id` (UUID, Foreign Key)
- `room_type_id` (UUID)
- `amount` (Decimal)
- `currency` (String, default: USD)
- `date` (Date)
- `conditions` (JSONB, nullable)
- `is_active` (Boolean)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)