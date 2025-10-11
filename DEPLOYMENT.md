# Deployment Guide - Cost Plus Drugs MCP Server

This guide will help you deploy the Cost Plus Drugs MCP Server to Render and connect it to ChatGPT.

## Prerequisites

- GitHub account
- Render account (free tier works fine)
- Git repository with your code

## Deploy to Render

### Option 1: One-Click Deploy (Recommended)

1. **Push your code to GitHub** (already done!)
   
2. **Connect to Render:**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `DavidOsherdiagnostica/cost-plus-drugs`
   - Render will auto-detect the `render.yaml` configuration

3. **Deploy:**
   - Click "Create Web Service"
   - Wait for the build to complete (~2-3 minutes)
   - Your server will be live at: `https://cost-plus-drugs-mcp-server.onrender.com`

### Option 2: Manual Configuration

If the auto-detection doesn't work:

1. **Create New Web Service on Render**
2. **Configure:**
   - **Name**: `cost-plus-drugs-mcp-server`
   - **Runtime**: Node
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:http`
   - **Plan**: Free

3. **Environment Variables** (auto-configured from `render.yaml`):
   ```
   NODE_ENV=production
   PORT=3000
   API_BASE_URL=https://www.costplusdrugs.com
   MCP_SERVER_NAME=cost-plus-drugs-mcp-server
   MCP_API_KEY=your-secure-api-key-here
   ```
   
   **Important**: Set `MCP_API_KEY` to a secure random string for production authentication.
   Generate one with: `openssl rand -base64 32`

4. **Health Check Path**: `/health`

## Verify Deployment

After deployment completes, test your server:

```bash
# Check health
curl https://YOUR-APP-NAME.onrender.com/health

# Check server info
curl https://YOUR-APP-NAME.onrender.com/
```

You should see:
```json
{
  "status": "healthy",
  "service": "cost-plus-drugs-mcp-server",
  "version": "1.0.0",
  "timestamp": "2025-01-11T..."
}
```

## Connect to ChatGPT (OpenAI Apps SDK)

### Step 1: Get Your Server URL

After deployment, your MCP endpoint will be:
```
https://YOUR-APP-NAME.onrender.com/mcp
```

### Step 2: Configure in ChatGPT

1. **Go to ChatGPT Settings**
   - Open ChatGPT
   - Navigate to Settings → Apps (or similar)

2. **Add Custom MCP Server**
   - Click "Add Server" or "Connect App"
   - Enter your server URL: `https://YOUR-APP-NAME.onrender.com/mcp`
   - Server Name: "Cost Plus Drugs"
   - Description: "Access affordable medication pricing from Cost Plus Drugs"

3. **Test Connection**
   - ChatGPT will send an `Initialize` request to your server
   - If successful, you'll see your tools available in ChatGPT

### Step 3: Test Your Tools

Try these prompts in ChatGPT:

1. **Search for medication:**
   ```
   "Find me information about metformin"
   ```

2. **Browse categories:**
   ```
   "What medication categories are available?"
   ```

3. **Get diabetes medications:**
   ```
   "Show me diabetes medications from Cost Plus Drugs"
   ```

## Important Notes

### Cloudflare 403 Issue

**Known Issue**: The Cost Plus Drugs API is protected by Cloudflare. When running locally or from some IP addresses, you may encounter `403 Forbidden` errors.

**Solution**: 
- ✅ **Works**: When deployed to cloud services (like Render) and accessed through ChatGPT/Claude Desktop
- ❌ **May fail**: Direct testing from local terminal or some development environments

This is expected behavior and does not affect production usage through ChatGPT.

### Free Tier Limitations

Render's free tier:
- Server may sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds (cold start)
- 750 hours/month of runtime
- This is perfect for testing and personal use!

### Monitoring

Monitor your deployment:
- **Render Dashboard**: View logs and metrics
- **Health Check**: `https://YOUR-APP-NAME.onrender.com/health`
- **Logs**: Real-time logs available in Render dashboard

## Troubleshooting

### Build Fails

If the build fails on Render:
```bash
# Check your dependencies
npm install
npm run build
```

### Server Won't Start

Check the logs in Render dashboard for errors. Common issues:
- Missing environment variables
- Port binding issues (Render sets PORT automatically)
- TypeScript compilation errors

### Tools Not Working in ChatGPT

1. Verify server is running: `curl https://YOUR-APP-NAME.onrender.com/health`
2. Check Render logs for errors
3. Test MCP endpoint: Try sending an `Initialize` request manually
4. Verify your server URL in ChatGPT settings

### 403 Errors from Cost Plus Drugs API

This is expected behavior due to Cloudflare protection:
- ✅ Should work fine when accessed through ChatGPT
- ❌ May fail in direct testing or local development
- The server code is correct, this is an external API limitation

## Next Steps

Once deployed and connected to ChatGPT:

1. ✅ Test all three tools
2. ✅ Monitor usage and errors
3. ✅ Gather feedback from users
4. 🚀 Consider upgrading to paid tier for production use

## Support

- **Issues**: https://github.com/DavidOsherdiagnostica/cost-plus-drugs/issues
- **Documentation**: See README.md

---

**Medical Disclaimer**: This software provides informational purposes only. Always consult qualified healthcare professionals for medical advice.

