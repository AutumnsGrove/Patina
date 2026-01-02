# Authentication Guide

## Why Authentication?

Patina stores SQL dumps of **all Grove databases**, including:
- User credentials and sessions (`groveauth`)
- OAuth tokens (`mycelium-oauth`)
- Personal user data across all applications

**Without authentication, anyone who discovers the worker URL could download complete database dumps.** This would be a critical security breach exposing all user data.

The API key requirement ensures only authorized users (you) can access backup data.

---

## Protected vs Public Endpoints

| Endpoint | Protected | Why |
|----------|-----------|-----|
| `GET /` | No | Just shows documentation, no sensitive data |
| `GET /health` | No | Needed for uptime monitoring, only returns system status |
| `GET /status` | **Yes** | Shows backup job details and storage info |
| `GET /list` | **Yes** | Lists all available backups with metadata |
| `POST /trigger` | **Yes** | Can initiate backup jobs |
| `GET /download/:date/:db` | **Yes** | **Downloads actual database dumps** |
| `GET /restore-guide/:db` | **Yes** | Shows available backups and download URLs |

---

## Setting Up the API Key

### Step 1: Generate a Secure Key

Use the same method as GroveAuth for consistency:

```bash
# Generate 32 bytes of random data, base64 encoded
API_KEY=$(openssl rand -base64 32)

# Display it (copy this somewhere safe!)
echo "Your API Key: $API_KEY"
```

This produces a 44-character key like: `j8j+5bnNwHM7sP6curEtCBwxWVGDHWpMB8Z3lArbDxg=`

### Step 2: Store as Cloudflare Secret

```bash
# Set the secret (will prompt for value, or pipe it)
wrangler secret put API_KEY

# Or pipe directly
echo "$API_KEY" | wrangler secret put API_KEY
```

### Step 3: Verify It Works

```bash
# This should fail (401 Unauthorized)
curl https://grove-backups.m7jv4v7npb.workers.dev/status

# This should succeed
curl -H "Authorization: Bearer $API_KEY" \
  https://grove-backups.m7jv4v7npb.workers.dev/status
```

---

## Using the API Key

Include the key in the `Authorization` header as a Bearer token:

```bash
# Format
Authorization: Bearer <your-api-key>

# Example
curl -H "Authorization: Bearer j8j+5bnNwHM7sP6curEtCBwxWVGDHWpMB8Z3lArbDxg=" \
  https://grove-backups.m7jv4v7npb.workers.dev/status
```

### Shell Variable (Recommended)

Set it as an environment variable for convenience:

```bash
# Add to ~/.bashrc or ~/.zshrc
export PATINA_API_KEY="j8j+5bnNwHM7sP6curEtCBwxWVGDHWpMB8Z3lArbDxg="

# Then use it
curl -H "Authorization: Bearer $PATINA_API_KEY" \
  https://grove-backups.m7jv4v7npb.workers.dev/list
```

---

## Rotating the API Key

If the key is compromised or you want to rotate it periodically:

### Step 1: Generate New Key

```bash
NEW_API_KEY=$(openssl rand -base64 32)
echo "New API Key: $NEW_API_KEY"
```

### Step 2: Update Cloudflare Secret

```bash
echo "$NEW_API_KEY" | wrangler secret put API_KEY
```

The change takes effect immediately. The old key will stop working.

### Step 3: Update Your Local Environment

```bash
# Update ~/.bashrc or ~/.zshrc
export PATINA_API_KEY="<new-key-here>"
```

---

## Error Responses

### Missing API Key
```json
{
  "error": "Unauthorized",
  "message": "Missing Authorization header. Use: Authorization: Bearer <api-key>"
}
```

### Invalid API Key
```json
{
  "error": "Unauthorized",
  "message": "Invalid API key"
}
```

### API Key Not Configured (Server Error)
```json
{
  "error": "API key not configured",
  "message": "Set API_KEY secret via: wrangler secret put API_KEY"
}
```

---

## Security Notes

1. **Never commit the API key** to git or include in code
2. **Use environment variables** for local development
3. **Rotate periodically** if you suspect compromise
4. **The key is stored encrypted** in Cloudflare's secrets store
5. **Constant-time comparison** is used to prevent timing attacks

---

## Troubleshooting

### "API key not configured"
The `API_KEY` secret hasn't been set:
```bash
wrangler secret put API_KEY
```

### "Invalid API key"
- Check for typos or extra whitespace
- Ensure you're using the correct key
- Try regenerating and resetting the key

### Key works in curl but not in code
- Ensure the header name is exactly `Authorization`
- Ensure the format is `Bearer <key>` (with space)
- Check for URL encoding issues with special characters

---

## Quick Reference

```bash
# Generate new key
openssl rand -base64 32

# Set/update key
wrangler secret put API_KEY

# Delete key (disables auth - NOT recommended)
wrangler secret delete API_KEY

# List all secrets
wrangler secret list

# Test auth
curl -H "Authorization: Bearer $PATINA_API_KEY" \
  https://grove-backups.m7jv4v7npb.workers.dev/health
```
