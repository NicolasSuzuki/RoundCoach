import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import * as request from 'supertest';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { AppModule } from '../src/app.module';

describe('RoundCoach API (e2e)', () => {
  const prisma = new PrismaClient();
  const testEmail = `e2e-${Date.now()}@roundcoach.test`;
  const testPassword = '123456';

  let app: INestApplication;
  let accessToken = '';
  let matchId = '';
  let vodId = '';

  beforeAll(async () => {
    process.env.QUEUE_PROVIDER = 'stub';
    process.env.PORT = '3000';
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/roundcoach?schema=public';
    process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'super-secret-change-me';
    process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1d';
    process.env.APP_NAME = process.env.APP_NAME ?? 'RoundCoach API';
    process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? '*';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: 'e2e-',
        },
      },
    });
    await app.close();
    await prisma.$disconnect();
  });

  it('registers a user', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        name: 'E2E User',
        email: testEmail,
        password: testPassword,
      })
      .expect(HttpStatus.CREATED);

    expect(response.body.data.user.email).toBe(testEmail);
    expect(response.body.data.accessToken).toBeDefined();
  });

  it('logs in and stores the access token', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      })
      .expect(HttpStatus.OK);

    accessToken = response.body.data.accessToken;

    expect(accessToken).toBeTruthy();
    expect(response.body.data.user.email).toBe(testEmail);
  });

  it('updates the player profile', async () => {
    const response = await request(app.getHttpServer())
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'E2E User',
        currentRank: 'Diamond 1',
        targetRank: 'Ascendant 1',
        currentGoal: 'Subir com mais consistencia',
        mainAgents: ['Jett', 'Omen'],
        mainRole: 'Duelist',
        currentFocus: 'Evitar first death',
      })
      .expect(HttpStatus.OK);

    expect(response.body.data.targetRank).toBe('Ascendant 1');
    expect(response.body.data.mainAgents).toEqual(['Jett', 'Omen']);
  });

  it('creates a match', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/matches')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        map: 'Ascent',
        agent: 'Jett',
        result: 'WIN',
        score: '13-9',
        matchDate: '2026-03-26T02:30:00.000Z',
        notes: 'Partida de teste e2e',
      })
      .expect(HttpStatus.CREATED);

    matchId = response.body.data.id;

    expect(matchId).toBeTruthy();
    expect(response.body.data.map).toBe('Ascent');
  });

  it('creates a vod', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/vods')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        matchId,
        fileName: 'e2e-vod.mp4',
        fileUrl: 'https://storage.local/e2e-vod.mp4',
        durationSeconds: 1800,
      })
      .expect(HttpStatus.CREATED);

    vodId = response.body.data.id;

    expect(vodId).toBeTruthy();
    expect(response.body.data.matchId).toBe(matchId);
  });

  it('processes the vod and completes the analysis', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/vods/${vodId}/process`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    const analysis = await waitForAnalysisCompletion(app, accessToken, matchId);

    expect(analysis.processingStatus).toBe('COMPLETED');
    expect(analysis.coach).toBeDefined();
    expect(analysis.overallScore).toBeGreaterThan(0);
  });

  it('returns dashboard summary and evolution', async () => {
    const summaryResponse = await request(app.getHttpServer())
      .get('/api/v1/dashboard/summary')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    expect(summaryResponse.body.data.totalAnalysedMatches).toBeGreaterThanOrEqual(1);
    expect(summaryResponse.body.data.averageScore).toBeGreaterThan(0);

    const evolutionResponse = await request(app.getHttpServer())
      .get('/api/v1/dashboard/evolution')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    expect(Array.isArray(evolutionResponse.body.data)).toBe(true);
    expect(evolutionResponse.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('returns the current training plan and dashboard training payload', async () => {
    const currentPlanResponse = await request(app.getHttpServer())
      .get('/api/v1/training-plans/current')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    expect(currentPlanResponse.body.data.status).toBe('ACTIVE');
    expect(currentPlanResponse.body.data.dailyTrainingPlan.warmup.length).toBeGreaterThan(0);
    expect(currentPlanResponse.body.data.microGoal).toBeTruthy();

    const dashboardPlanResponse = await request(app.getHttpServer())
      .get('/api/v1/dashboard/training-plan')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    expect(dashboardPlanResponse.body.data.focusArea).toBeTruthy();
    expect(dashboardPlanResponse.body.data.weeklyFocusPlan.title).toBeTruthy();
    expect(dashboardPlanResponse.body.data.dailyTrainingPlan.inGame.length).toBeGreaterThan(0);
  });

  it('generates a fresh training plan and supersedes the previous one', async () => {
    const firstPlan = await request(app.getHttpServer())
      .get('/api/v1/training-plans/current')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    const regeneratedPlan = await request(app.getHttpServer())
      .post('/api/v1/training-plans/generate')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    expect(regeneratedPlan.body.data.status).toBe('ACTIVE');
    expect(regeneratedPlan.body.data.version).toBeGreaterThanOrEqual(
      firstPlan.body.data.version + 1,
    );
  });
});

async function waitForAnalysisCompletion(
  app: INestApplication,
  accessToken: string,
  matchId: string,
) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/matches/${matchId}/analysis`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    if (response.body.data.processingStatus === 'COMPLETED') {
      return response.body.data;
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  throw new Error('Analysis did not complete in time');
}
