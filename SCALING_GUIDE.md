# STRIDE Scaling Guide

This guide explains how to scale the STRIDE e-commerce application to handle 10,000+ concurrent users.

## Table of Contents

1. [Infrastructure Scaling](#infrastructure-scaling)
2. [Configuration Setup](#configuration-setup)
3. [Monitoring & Observability](#monitoring--observability)
4. [Load Testing](#load-testing)
5. [Backup Strategy](#backup-strategy)
6. [Cost Estimates](#cost-estimates)

---

## Infrastructure Scaling

### Current Architecture

```
User → Next.js (Server) → PostgreSQL → Redis (optional) → R2 (Images)
```

### Recommended Scaled Architecture

```
                   ┌─────────────┐
                   │   CDN       │
                   │ (Cloudflare)│
                   └──────┬──────┘
                          │
                   ┌──────▼──────┐
                   │ Load Balancer│
                   └──────┬──────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
   │ Next.js │      │ Next.js │      │ Next.js │
   │ Instance│      │ Instance│      │ Instance│
   └────┬────┘      └────┬────┘      └────┬────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
   │Redis    │      │PostgreSQL│      │   R2    │
   │(Upstash)│      │(Managed) │      │(Images) │
   └─────────┘      └──────────┘      └─────────┘
```

### Scaling Components

#### 1. Database (PostgreSQL)

**Current:** Single instance
**Recommended:** Managed PostgreSQL with read replicas

**Options:**
- **Supabase** (Recommended): $25-100/month
  - Automatic read replicas
  - Connection pooling
  - Auto-scaling
  - Built-in backups
  
- **Neon**: $19-129/month
  - Serverless PostgreSQL
  - Auto-scaling
  - Branching for testing
  
- **Railway**: $5-30/month (starter), scales up
  - Simple setup
  - Good for MVP

**Configuration:**
```env
DATABASE_URL="postgresql://user:password@host:5432/db?pgbouncer=true&connection_limit=20"
```

**Capacity:** 1,000-2,000 concurrent users per instance (with pooling)

#### 2. Application Servers (Next.js)

**Current:** Single server instance
**Recommended:** 4-8 instances with load balancer

**Options:**
- **Vercel** (Recommended): Pay-as-you-go
  - Auto-scaling
  - Edge network
  - Zero config
  - $0.60/GB hours serverless
  
- **AWS EC2**: $20-100/month per instance
  - Full control
  - Load balancer needed
  
- **DigitalOcean**: $12-48/month per instance
  - Simple pricing
  - Good value

**Capacity:** 500-1,000 concurrent users per instance

#### 3. Redis (Caching & Rate Limiting)

**Current:** Not configured
**Recommended:** Upstash Redis Pro

**Options:**
- **Upstash Redis** (Recommended): $0.20-0.50/100K commands
  - Edge Redis
  - Auto-scaling
  - Free tier available
  
- **AWS ElastiCache**: $15-50/month
  - Full Redis features
  - Need AWS account

**Capacity:** 10,000+ concurrent requests easily

#### 4. CDN (Static Assets)

**Current:** Cloudflare R2 (images only)
**Recommended:** Cloudflare CDN for all static assets

**Configuration:** Already implemented in `next.config.ts`

**Capacity:** Unlimited

---

## Configuration Setup

### 1. Environment Variables

Add these to your `.env.local`:

```env
# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Sentry (Error Tracking)
SENTRY_DSN="https://your-dsn@sentry.io/project-id"

# Database with Connection Pooling
DATABASE_URL="postgresql://user:password@host:5432/db?pgbouncer=true&connection_limit=20"

# NextAuth Secret (Required for production)
AUTH_SECRET="generate-with-openssl-rand-base64-32"
```

### 2. Install Dependencies

```bash
npm install @sentry/nextjs
```

### 3. Install Sentry

```bash
npx @sentry/wizard@latest -i nextjs
```

### 4. Configure Redis (Upstash)

1. Go to [Upstash Console](https://console.upstash.com)
2. Create a new Redis database
3. Copy REST URL and Token
4. Add to environment variables

### 5. Set Up Database Replicas

**Using Supabase:**
1. Go to Database → Replication
2. Enable read replicas
3. Update connection string to use read replicas for read operations

**Using Neon:**
1. Enable branching
2. Use read replica endpoints

---

## Monitoring & Observability

### 1. Sentry (Error Tracking)

**Features:**
- Error tracking
- Performance monitoring
- Session replay
- Release tracking

**Setup:**
```bash
npx @sentry/wizard@latest -i nextjs
```

**Configuration:** Already configured in `sentry.config.js`

**Cost:** Free tier available, then $26/month

### 2. Vercel Analytics

**Features:**
- Web vitals
- Page views
- User analytics

**Setup:** Already integrated (via `@vercel/analytics`)

**Cost:** Free

### 3. Custom Metrics

Add these to your application:

```typescript
// src/lib/metrics.ts
export async function trackMetric(name: string, value: number) {
  // Send to Sentry or custom analytics
  // Implement based on your monitoring tool
}
```

---

## Load Testing

### Run Load Test

```bash
# Start your application
npm run dev

# In another terminal, run load test
npm run load:test
```

### Configuration

Edit `scripts/load-test.ts` to adjust:

```typescript
const config: LoadTestConfig = {
  concurrentUsers: 100,      // Increase for 10K users
  totalRequests: 10000,      // Total requests to send
  rampUpTime: 10,            // Seconds to ramp up
  testDuration: 60,          // Test duration in seconds
}
```

### Interpret Results

**Good Performance:**
- Average response time: < 500ms
- Success rate: > 95%
- Requests/sec: > 50

**Needs Optimization:**
- Average response time: > 1s
- Success rate: < 90%
- Requests/sec: < 20

---

## Backup Strategy

### Automated Backups

**Script:** `scripts/backup-database.ts`

**Run manually:**
```bash
npm run backup:database
```

**Set up cron job (Linux):**
```bash
# Daily backup at 2 AM
0 2 * * * cd /path/to/Stride && npm run backup:database
```

**Backup Retention:**
- Daily: 7 days
- Weekly: 4 weeks
- Monthly: 12 months

### Cloud Storage Backup

Add cloud storage upload to `scripts/backup-database.ts`:

```typescript
async function uploadToCloudStorage(backupPath: string): Promise<void> {
  // Implement for AWS S3, Backblaze B2, or R2
  // Example with R2:
  const s3 = new S3Client({ /* config */ })
  await s3.send(new PutObjectCommand({
    Bucket: 'stride-backups',
    Key: path.basename(backupPath),
    Body: createReadStream(backupPath),
  }))
}
```

---

## Cost Estimates

### For 10,000 Concurrent Users

| Component | Provider | Cost/Month | Notes |
|-----------|---------|------------|-------|
| Database | Supabase | $50-100 | 4GB RAM, 2 CPUs, read replicas |
| App Servers | Vercel | $100-300 | Serverless, auto-scaling |
| Redis | Upstash | $20-50 | 256MB-1GB memory |
| CDN | Cloudflare | Free | Static assets |
| Monitoring | Sentry | $26 | Error tracking |
| **Total** | | **$196-476** | |

### For 1,000 Concurrent Users (MVP)

| Component | Provider | Cost/Month | Notes |
|-----------|---------|------------|-------|
| Database | Railway | $5-20 | Shared instance |
| App Servers | Vercel | $20-50 | Hobby tier |
| Redis | Upstash | Free | Free tier |
| CDN | Cloudflare | Free | Static assets |
| Monitoring | Sentry | Free | Free tier |
| **Total** | | **$25-70** | |

---

## Scaling Roadmap

### Phase 1: MVP (100-500 concurrent users)
- ✅ Redis caching (implemented)
- ✅ CDN for static assets (implemented)
- ✅ Performance monitoring (implemented)
- ✅ Database backups (implemented)
- ⏳ Load testing (ready to run)

### Phase 2: Growth (500-2,000 concurrent users)
- Database connection pooling
- Read replicas for database
- 2-3 app server instances
- Redis Pro tier

### Phase 3: Scale (2,000-10,000 concurrent users)
- 4-8 app server instances
- Load balancer
- Database sharding
- Queue system for background jobs
- Edge computing

### Phase 4: Enterprise (10,000+ concurrent users)
- Microservices architecture
- Event-driven architecture
- Multi-region deployment
- Advanced caching strategies
- Database clustering

---

## Quick Start Checklist

### Before Launch (MVP)
- [ ] Set up Upstash Redis
- [ ] Configure Sentry
- [ ] Set AUTH_SECRET
- [ ] Enable database connection pooling
- [ ] Run load test
- [ ] Set up automated backups
- [ ] Configure CDN (already done)
- [ ] Enable Redis caching (already done)

### Before Scale (10K users)
- [ ] Set up database read replicas
- [ ] Configure load balancer
- [ ] Deploy 4-8 app instances
- [ ] Upgrade Redis to Pro tier
- [ ] Set up monitoring dashboards
- [ ] Configure alerts
- [ ] Test failover procedures
- [ ] Document disaster recovery

---

## Troubleshooting

### High Response Times
1. Check Redis is working
2. Verify database indexes
3. Check for N+1 queries
4. Review cache hit rates

### Database Connection Errors
1. Increase connection pool size
2. Enable PgBouncer
3. Add read replicas
4. Check connection limits

### Memory Issues
1. Check for memory leaks
2. Optimize image sizes
3. Reduce cache TTL
4. Scale up instances

---

## Support

For help with scaling:
- **Database:** Supabase/Neon documentation
- **Redis:** Upstash documentation
- **Monitoring:** Sentry documentation
- **Hosting:** Vercel documentation

---

## Next Steps

1. Run `npm run load:test` to benchmark current performance
2. Set up Upstash Redis and add to environment variables
3. Configure Sentry for error tracking
4. Set up automated backups with cron
5. Monitor performance and scale as needed
