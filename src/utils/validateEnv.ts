export function validateEnv() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SITE_URL',
    'GOOGLE_ANALYTICS_ID',
    'ADSENSE_CLIENT_ID',
  ];
  
  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );
  
  if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing required environment variables');
    }
  }
} 