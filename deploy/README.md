# Digital Ocean Deployment Guide

This guide explains how to deploy the OnboardTicket app to Digital Ocean instead of Netlify.

## Deployment Options

### 1. Digital Ocean App Platform (Recommended)

The easiest way to deploy to Digital Ocean is using their App Platform:

#### Setup Steps:

1. **Fork/Clone the repository** to your GitHub account

2. **Install doctl CLI** (Digital Ocean CLI):
   ```bash
   # macOS
   brew install doctl
   
   # Linux/Windows - download from https://github.com/digitalocean/doctl/releases
   ```

3. **Authenticate with Digital Ocean**:
   ```bash
   doctl auth init
   ```

4. **Update the app spec**:
   - Edit `deploy/digital-ocean-app.yaml`
   - Update the GitHub repo URL to your fork
   - Set environment variables (see below)

5. **Deploy the app**:
   ```bash
   doctl apps create --spec deploy/digital-ocean-app.yaml
   ```

6. **Set environment variables** in the Digital Ocean dashboard:
   - Go to Apps → Your App → Settings → Environment Variables
   - Add all required environment variables (see list below)

### 2. Digital Ocean Droplet with Docker

For more control, deploy to a Droplet using Docker:

#### Setup Steps:

1. **Create a Droplet**:
   - Ubuntu 22.04 LTS
   - At least 1GB RAM (2GB recommended)
   - Enable Docker during creation

2. **Connect to your Droplet**:
   ```bash
   ssh root@your-droplet-ip
   ```

3. **Clone your repository**:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

4. **Create environment file**:
   ```bash
   cp .env.example .env
   nano .env  # Add your environment variables
   ```

5. **Build and run with Docker**:
   ```bash
   docker-compose up -d
   ```

6. **Set up reverse proxy** (optional but recommended):
   - Install Nginx
   - Configure SSL with Certbot
   - Proxy traffic to your Docker container

### 3. Digital Ocean Kubernetes

For production scalability, deploy to Digital Ocean Kubernetes:

1. **Create a Kubernetes cluster** in Digital Ocean
2. **Build and push Docker image** to Digital Ocean Container Registry
3. **Apply Kubernetes manifests** (create deployment.yaml and service.yaml)

## Required Environment Variables

Set these environment variables in your chosen deployment method:

### Database & Authentication
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side)
- `VITE_SUPABASE_URL` - Supabase URL (client-side)
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key (client-side)

### Payment Processing
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

### Email Service
- `SENDGRID_API_KEY` - SendGrid API key for email notifications

### Flight Data
- `AMADEUS_CLIENT_ID` - Amadeus API client ID
- `AMADEUS_CLIENT_SECRET` - Amadeus API client secret

### App Configuration
- `NODE_ENV=production`
- `PORT=8080` (for App Platform) or `PORT=3000` (for Docker)

## Migration from Netlify

If you're migrating from Netlify:

1. **Update API endpoints**: The app is already configured to work with both Netlify Functions and Express server
2. **Environment variables**: Copy your environment variables from Netlify to Digital Ocean
3. **Custom domain**: Update your DNS to point to your Digital Ocean app
4. **SSL certificates**: Digital Ocean App Platform provides automatic SSL

## Monitoring & Maintenance

### Health Checks
The app includes a health check endpoint at `/api/health` that verifies:
- Server status
- Database connectivity
- External service availability

### Logs
- **App Platform**: View logs in the Digital Ocean dashboard
- **Docker**: Use `docker-compose logs -f`
- **Droplet**: Check logs with `journalctl` or application logs

### Scaling
- **App Platform**: Adjust instance count and size in the dashboard
- **Docker**: Scale with `docker-compose up -d --scale app=3`
- **Kubernetes**: Use `kubectl scale deployment`

## Security Considerations

1. **Environment Variables**: Never commit secrets to git
2. **Firewall**: Configure firewall rules for your Droplet
3. **Updates**: Keep your base images and dependencies updated
4. **SSL**: Always use HTTPS in production
5. **Database**: Ensure your Supabase instance has proper security settings

## Cost Optimization

- **App Platform**: Start with basic-xxs ($5/month)
- **Droplet**: Start with $6/month droplet
- **Database**: Use Supabase free tier initially
- **CDN**: Consider Digital Ocean Spaces for static assets

## Troubleshooting

### Common Issues:

1. **Build failures**: Check build logs for missing dependencies
2. **Environment variables**: Verify all required vars are set
3. **Database connection**: Check Supabase URL and keys
4. **API errors**: Verify external service credentials

### Getting Help:

- Check application logs first
- Use the service status logger in browser console
- Review Digital Ocean documentation
- Check GitHub issues for known problems

## Support

For deployment issues specific to this application:
1. Check the browser console for service status
2. Review server logs for errors
3. Verify all environment variables are correctly set
4. Ensure external services (Supabase, Stripe, etc.) are properly configured
