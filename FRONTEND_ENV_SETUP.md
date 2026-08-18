# Frontend Environment Variables Setup

## .env File

Create a `.env` file in the `eti_frontend` directory:

```env
# Backend API URL
# For local development:
NEXT_PUBLIC_API_URL=http://localhost:8000

# For production, use your backend URL:
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## Important Notes

1. **NEXT_PUBLIC_ prefix**: In Next.js, environment variables must start with `NEXT_PUBLIC_` to be accessible in the browser.

2. **Default Value**: If you don't create a `.env` file, it will default to `http://localhost:8000`.

3. **Restart Required**: After changing `.env` file, you need to restart the Next.js dev server:
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

## Environment-Specific Files

You can also create environment-specific files:

- `.env.local` - Local development (gitignored)
- `.env.development` - Development environment
- `.env.production` - Production environment

## Example .env.local (for local development)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Example .env.production (for production)

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## Verification

To verify the API URL is being used correctly:

1. Check browser console for API calls
2. Look at Network tab in DevTools
3. The API calls should go to the URL specified in `NEXT_PUBLIC_API_URL`

## No .env File Needed?

If you're running everything locally with default ports:
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`

You don't need a `.env` file - it will use the default `http://localhost:8000`.

