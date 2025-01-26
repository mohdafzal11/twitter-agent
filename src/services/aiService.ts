import OpenAI from 'openai';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { StatusCodes } from 'http-status-codes';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface Persona {
  name: string;
  prompt: string;
}


interface GenerateResponseRequest {
  persona: Persona;
  userTweet: string;
}

async function generateAIResponse(persona: Persona, userTweet: string): Promise<ServiceResponse<string | null>> {
  try {
    console.log('Generating AI response...');
    if (!userTweet.trim()) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        'User tweet cannot be empty',
        null,
        StatusCodes.BAD_REQUEST
      );
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: persona.prompt },
        { role: 'user', content: userTweet }
      ],
      max_tokens: 100,
    });
    
    const content = response.choices[0].message.content?.trim();
    
    if (!content) {
      console.error('Failed to generate AI response');
      return new ServiceResponse(
        ResponseStatus.Failed,
        'Failed to generate AI response',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    return new ServiceResponse(
      ResponseStatus.Success,
      'AI response generated successfully',
      content,
      StatusCodes.OK
    );
  } catch (error) {
    console.error('Error generating AI response:', error);
    return new ServiceResponse(
      ResponseStatus.Failed,
      'Failed to generate AI response',
      null,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

export const aiService = {
  async generateResponse(body: any): Promise<ServiceResponse<string | null>> {
    if (!body.persona || !body.userTweet) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        'Missing required fields',
        null,
        StatusCodes.BAD_REQUEST
      );
    }
    return generateAIResponse(body.persona, body.userTweet);
  }
};
