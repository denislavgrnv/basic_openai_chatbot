import { Agent } from '@openai/agents';

const agent = new Agent({
  name: 'Assistant',
  instructions: 'Respond in a helpful and informative manner, using clear and concise language, dont use symbols.',
  model: 'gpt-5.4',
});

export default agent;