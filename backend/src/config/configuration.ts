export default () => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  database: {
    uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/task-manager',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM ?? 'Task Manager <no-reply@taskmanager.com>',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  weather: {
    apiKey: process.env.OPENWEATHER_API_KEY,
  },
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
});
