import { Agent } from '@openai/agents';

const initiate_registration = {
  type: "function",
    name: "initiate_registration",
    description: "Captures user details. Only call when both name and email are present.",
    parameters: {
        type: "object",
        properties: {
            full_name: { type: "string" },
            email: { type: "string" }
        },
        required: ["full_name", "email"],
        additionalProperties: false
    },
    invoke: async (args) => args, 
    needsApproval: () => false
};

const agent = new Agent({
  name: 'Assistant',
  instructions: `
    - PRIMARY ROLE: You are a friendly chat assistant. Answer any general questions normally.
    - REGISTRATION RULE: Do NOT ask for personal details (name/email) or suggest registration unless the user mentions "signing up", "creating an account", or "saving history" or something similar.
    - TOOL TRIGGER: Only call 'initiate_registration' if the user explicitly says they want to register AND they have provided their name and email.
    - BEHAVIOR: If the user is just chatting, remain in a standard conversational mode.
    - FORMATTING: Plain text only. No markdown, no bolding.
  `,
  model: 'gpt-5.4', 
  tools: [initiate_registration],
});

export default agent;