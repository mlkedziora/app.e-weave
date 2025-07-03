// backend/src/main.ts
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // ✅ Enable CORS for frontend
  app.enableCors({
    origin: 'http://localhost:5173', // or '*' during dev
    credentials: true,
  })

  await app.listen(3000)
}
bootstrap()

