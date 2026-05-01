import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CoachWritingInput,
  CoachWritingResult,
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

    const parsed = JSON.parse(outputText) as Omit<CoachWritingResult, 'source'>;

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

    const parsed = JSON.parse(outputText) as Omit<CoachWritingResult, 'source'>;

    if (!parsed.observation || !Array.isArray(parsed.recommendedTraining)) {
      throw new Error('Ollama response did not match coach writing shape');
    }

    return {
      observation: parsed.observation,
      recommendedTraining: parsed.recommendedTraining.slice(0, 3),
    };
  }
}
