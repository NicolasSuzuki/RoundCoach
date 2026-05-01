import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CoachWritingInput,
  CoachWritingResult,
  TrainingPlanWritingInput,
  TrainingPlanWritingResult,
} from './types/coach-writing-input.type';

@Injectable()
export class CoachWriterService {
  private readonly logger = new Logger(CoachWriterService.name);

  constructor(private readonly configService: ConfigService) {}

  async write(input: CoachWritingInput): Promise<CoachWritingResult> {
    const enabled = this.configService.get<boolean>('openai.enabled', false);
    const provider = this.configService.get<string>('openai.provider', 'openai');
    const apiKey = this.configService.get<string>('openai.apiKey', '');

    if (!enabled || (provider === 'openai' && !apiKey)) {
      return this.writeDeterministic(input);
    }

    try {
      const aiWriting =
        provider === 'ollama'
          ? await this.writeWithOllama(input, apiKey)
          : await this.writeWithOpenAiResponses(input, apiKey);
      return {
        ...aiWriting,
        source: 'ai',
      };
    } catch (error) {
      this.logger.warn(
        `${provider} coach writer fallback: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      return this.writeDeterministic(input);
    }
  }

  async writeTrainingPlan(
    input: TrainingPlanWritingInput,
  ): Promise<TrainingPlanWritingResult> {
    const enabled = this.configService.get<boolean>('openai.enabled', false);
    const provider = this.configService.get<string>('openai.provider', 'openai');
    const apiKey = this.configService.get<string>('openai.apiKey', '');

    if (!enabled || (provider === 'openai' && !apiKey)) {
      return this.writeTrainingPlanDeterministic(input);
    }

    try {
      const aiWriting =
        provider === 'ollama'
          ? await this.writeTrainingPlanWithOllama(input, apiKey)
          : await this.writeTrainingPlanWithOpenAiResponses(input, apiKey);
      return {
        ...aiWriting,
        source: 'ai',
      };
    } catch (error) {
      this.logger.warn(
        `${provider} training plan writer fallback: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      return this.writeTrainingPlanDeterministic(input);
    }
  }

  private writeDeterministic(input: CoachWritingInput): CoachWritingResult {
    const profileParts = [
      input.profile?.currentRank ? `rank atual ${input.profile.currentRank}` : null,
      input.profile?.mainRole ? `role principal ${input.profile.mainRole}` : null,
      input.profile?.currentGoal ? `objetivo ${input.profile.currentGoal}` : null,
    ].filter((part): part is string => Boolean(part));
    const profilePrefix = profileParts.length
      ? `Considerando ${profileParts.join(', ')}, `
      : '';
    const focusTail = input.profile?.currentFocus
      ? ` Seu foco declarado continua sendo ${input.profile.currentFocus.toLowerCase()}.`
      : '';

    return {
      observation: `${profilePrefix}${input.diagnosis.observation}${focusTail}`,
      recommendedTraining: input.diagnosis.recommendedTraining,
      source: 'deterministic',
    };
  }

  private writeTrainingPlanDeterministic(
    input: TrainingPlanWritingInput,
  ): TrainingPlanWritingResult {
    return {
      weeklyFocusTitle: input.plan.weeklyFocusPlan.title,
      weeklyGoals: input.plan.weeklyFocusPlan.goals,
      justification: input.plan.justification,
      warmup: input.plan.dailyTrainingPlan.warmup,
      inGame: input.plan.dailyTrainingPlan.inGame,
      review: input.plan.dailyTrainingPlan.review,
      microGoal: input.plan.microGoal,
      source: 'deterministic',
    };
  }

  private async writeWithOpenAiResponses(
    input: CoachWritingInput,
    apiKey: string,
  ): Promise<Omit<CoachWritingResult, 'source'>> {
    const model = this.configService.get<string>('openai.model', 'gpt-5');
    const baseUrl = this.configService.get<string>(
      'openai.baseUrl',
      'https://api.openai.com/v1',
    );
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/responses`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        input: [
          {
            role: 'developer',
            content: [
              {
                type: 'input_text',
                text:
                  'Voce escreve como um coach de VALORANT objetivo. Use somente as evidencias recebidas. Nao invente estatisticas, ranks, mapas, agentes ou causas taticas nao presentes nos dados. Escreva em portugues do Brasil, tom direto, pratico e sem exageros.',
              },
            ],
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: JSON.stringify({
                  task: 'Reescrever o diagnostico do dashboard e treino recomendado.',
                  profile: input.profile ?? null,
                  diagnosis: input.diagnosis,
                  constraints: {
                    observation:
                      'Uma frase ou paragrafo curto, ate 420 caracteres.',
                    recommendedTraining:
                      'Tres itens acionaveis, cada um com ate 120 caracteres.',
                    noFabrication: true,
                  },
                }),
              },
            ],
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'roundcoach_dashboard_coach_writing',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                observation: {
                  type: 'string',
                },
                recommendedTraining: {
                  type: 'array',
                  minItems: 3,
                  maxItems: 3,
                  items: {
                    type: 'string',
                  },
                },
              },
              required: ['observation', 'recommendedTraining'],
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `AI request failed with status ${response.status}: ${errorBody.slice(0, 400)}`,
      );
    }

    const data = (await response.json()) as {
      output_text?: string;
      output?: Array<{
        content?: Array<{
          type?: string;
          text?: string;
        }>;
      }>;
    };
    const outputText =
      data.output_text ??
      data.output
        ?.flatMap((item) => item.content ?? [])
        .find((content) => content.type === 'output_text')?.text;

    if (!outputText) {
      throw new Error('OpenAI response did not include output text');
    }

    const parsed = this.parseJsonObject(outputText) as Omit<
      CoachWritingResult,
      'source'
    >;

    if (!parsed.observation || !Array.isArray(parsed.recommendedTraining)) {
      throw new Error('OpenAI response did not match coach writing shape');
    }

    return {
      observation: parsed.observation,
      recommendedTraining: parsed.recommendedTraining.slice(0, 3),
    };
  }

  private async writeWithOllama(
    input: CoachWritingInput,
    apiKey: string,
  ): Promise<Omit<CoachWritingResult, 'source'>> {
    const model = this.configService.get<string>('openai.model', 'llama3.2');
    const baseUrl = this.configService.get<string>(
      'openai.baseUrl',
      'http://host.docker.internal:11434/v1',
    );
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const response = await fetch(
      `${baseUrl.replace(/\/$/, '')}/chat/completions`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          response_format: {
            type: 'json_object',
          },
          max_tokens: 300,
          messages: [
            {
              role: 'system',
              content:
                'Voce escreve como um coach de VALORANT objetivo. Use somente as evidencias recebidas. Nao invente estatisticas, ranks, mapas, agentes ou causas taticas nao presentes nos dados. Responda apenas com JSON valido no formato {"observation":"...","recommendedTraining":["...","...","..."]}.',
            },
            {
              role: 'user',
              content: JSON.stringify({
                task: 'Reescrever o diagnostico do dashboard e treino recomendado.',
                profile: input.profile ?? null,
                diagnosis: input.diagnosis,
                constraints: {
                  observation: 'Uma frase ou paragrafo curto, ate 420 caracteres.',
                  recommendedTraining:
                    'Tres itens acionaveis, cada um com ate 120 caracteres.',
                  noFabrication: true,
                },
              }),
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `AI request failed with status ${response.status}: ${errorBody.slice(0, 400)}`,
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };
    const outputText = data.choices?.[0]?.message?.content?.trim();

    if (!outputText) {
      throw new Error('Ollama response did not include assistant content');
    }

    const parsed = this.parseJsonObject(outputText) as Omit<
      CoachWritingResult,
      'source'
    >;

    if (!parsed.observation || !Array.isArray(parsed.recommendedTraining)) {
      throw new Error('Ollama response did not match coach writing shape');
    }

    return {
      observation: parsed.observation,
      recommendedTraining: parsed.recommendedTraining.slice(0, 3),
    };
  }

  private async writeTrainingPlanWithOpenAiResponses(
    input: TrainingPlanWritingInput,
    apiKey: string,
  ): Promise<Omit<TrainingPlanWritingResult, 'source'>> {
    const model = this.configService.get<string>('openai.model', 'gpt-5');
    const baseUrl = this.configService.get<string>(
      'openai.baseUrl',
      'https://api.openai.com/v1',
    );
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/responses`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        input: [
          {
            role: 'developer',
            content: [
              {
                type: 'input_text',
                text:
                  'Voce escreve como um coach de VALORANT objetivo. Reescreva um plano semanal ja calculado, sem alterar a intencao tecnica. Nao invente estatisticas, rotina, mapa, agente ou causa tática que nao esteja nos dados. Escreva em portugues do Brasil, direto e acionavel.',
              },
            ],
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: JSON.stringify({
                  task:
                    'Reescrever o plano de treino semanal mantendo coerencia com os dados.',
                  profile: input.profile ?? null,
                  plan: input.plan,
                  constraints: {
                    weeklyFocusTitle: 'Titulo curto, ate 80 caracteres.',
                    weeklyGoals: 'Tres objetivos claros, ate 120 caracteres cada.',
                    justification: 'Paragrafo curto, ate 320 caracteres.',
                    warmup: 'Duas tarefas objetivas.',
                    inGame: 'Tres regras simples para aplicar em partida.',
                    review: 'Duas revisoes rapidas.',
                    microGoal: 'Uma frase curta para a proxima fila.',
                    noFabrication: true,
                  },
                }),
              },
            ],
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'roundcoach_training_plan_writing',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                weeklyFocusTitle: { type: 'string' },
                weeklyGoals: {
                  type: 'array',
                  minItems: 3,
                  maxItems: 3,
                  items: { type: 'string' },
                },
                justification: { type: 'string' },
                warmup: {
                  type: 'array',
                  minItems: 2,
                  maxItems: 2,
                  items: { type: 'string' },
                },
                inGame: {
                  type: 'array',
                  minItems: 3,
                  maxItems: 3,
                  items: { type: 'string' },
                },
                review: {
                  type: 'array',
                  minItems: 2,
                  maxItems: 2,
                  items: { type: 'string' },
                },
                microGoal: { type: 'string' },
              },
              required: [
                'weeklyFocusTitle',
                'weeklyGoals',
                'justification',
                'warmup',
                'inGame',
                'review',
                'microGoal',
              ],
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `AI request failed with status ${response.status}: ${errorBody.slice(0, 400)}`,
      );
    }

    const data = (await response.json()) as {
      output_text?: string;
      output?: Array<{
        content?: Array<{
          type?: string;
          text?: string;
        }>;
      }>;
    };
    const outputText =
      data.output_text ??
      data.output
        ?.flatMap((item) => item.content ?? [])
        .find((content) => content.type === 'output_text')?.text;

    if (!outputText) {
      throw new Error('OpenAI response did not include output text');
    }

    const parsed = this.parseJsonObject(outputText) as Omit<
      TrainingPlanWritingResult,
      'source'
    >;

    this.assertTrainingPlanWriting(parsed, 'OpenAI');
    return {
      weeklyFocusTitle: parsed.weeklyFocusTitle,
      weeklyGoals: parsed.weeklyGoals.slice(0, 3),
      justification: parsed.justification,
      warmup: parsed.warmup.slice(0, 2),
      inGame: parsed.inGame.slice(0, 3),
      review: parsed.review.slice(0, 2),
      microGoal: parsed.microGoal,
    };
  }

  private async writeTrainingPlanWithOllama(
    input: TrainingPlanWritingInput,
    apiKey: string,
  ): Promise<Omit<TrainingPlanWritingResult, 'source'>> {
    const model = this.configService.get<string>('openai.model', 'llama3.2');
    const baseUrl = this.configService.get<string>(
      'openai.baseUrl',
      'http://host.docker.internal:11434/v1',
    );
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const response = await fetch(
      `${baseUrl.replace(/\/$/, '')}/chat/completions`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          response_format: {
            type: 'json_object',
          },
          max_tokens: 500,
          messages: [
            {
              role: 'system',
              content:
                'Voce escreve como um coach de VALORANT objetivo. Reescreva um plano semanal ja calculado, sem alterar a intencao tecnica. Nao invente estatisticas, ranks, mapas, agentes ou causas taticas nao presentes nos dados. Responda apenas com JSON valido no formato {"weeklyFocusTitle":"...","weeklyGoals":["...","...","..."],"justification":"...","warmup":["...","..."],"inGame":["...","...","..."],"review":["...","..."],"microGoal":"..."}.',
            },
            {
              role: 'user',
              content: JSON.stringify({
                task:
                  'Reescrever o plano de treino semanal mantendo coerencia com os dados.',
                profile: input.profile ?? null,
                plan: input.plan,
                constraints: {
                  weeklyFocusTitle: 'Titulo curto, ate 80 caracteres.',
                  weeklyGoals: 'Tres objetivos claros, ate 120 caracteres cada.',
                  justification: 'Paragrafo curto, ate 320 caracteres.',
                  warmup: 'Duas tarefas objetivas.',
                  inGame: 'Tres regras simples para aplicar em partida.',
                  review: 'Duas revisoes rapidas.',
                  microGoal: 'Uma frase curta para a proxima fila.',
                  noFabrication: true,
                },
              }),
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `AI request failed with status ${response.status}: ${errorBody.slice(0, 400)}`,
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };
    const outputText = data.choices?.[0]?.message?.content?.trim();

    if (!outputText) {
      throw new Error('Ollama response did not include assistant content');
    }

    const parsed = this.parseJsonObject(outputText) as Omit<
      TrainingPlanWritingResult,
      'source'
    >;

    this.assertTrainingPlanWriting(parsed, 'Ollama');
    return {
      weeklyFocusTitle: parsed.weeklyFocusTitle,
      weeklyGoals: parsed.weeklyGoals.slice(0, 3),
      justification: parsed.justification,
      warmup: parsed.warmup.slice(0, 2),
      inGame: parsed.inGame.slice(0, 3),
      review: parsed.review.slice(0, 2),
      microGoal: parsed.microGoal,
    };
  }

  private parseJsonObject(text: string): unknown {
    const trimmed = text.trim();
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error('No JSON object found in AI response');
    }

    const candidate = trimmed
      .slice(firstBrace, lastBrace + 1)
      .replace(/\u0000/g, '')
      .trim();

    return JSON.parse(candidate);
  }

  private assertTrainingPlanWriting(
    parsed: Partial<Omit<TrainingPlanWritingResult, 'source'>>,
    provider: 'OpenAI' | 'Ollama',
  ) {
    if (
      !parsed.weeklyFocusTitle ||
      !parsed.justification ||
      !parsed.microGoal ||
      !Array.isArray(parsed.weeklyGoals) ||
      !Array.isArray(parsed.warmup) ||
      !Array.isArray(parsed.inGame) ||
      !Array.isArray(parsed.review)
    ) {
      throw new Error(`${provider} response did not match training plan writing shape`);
    }
  }
}
