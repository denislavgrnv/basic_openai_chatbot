import agent from "./agent-init.mjs";
import { run } from '@openai/agents';
import readLineSync from 'readline-sync';
import colors from 'colors';

async function main() {
    let userQuestion = '';
    while (userQuestion !== 'exit' && userQuestion !== 'quit' && userQuestion !== 'bye') {
        userQuestion = readLineSync.question('You: ');
    
        const result = await run(
            agent,
            userQuestion
        );
    
        console.log(colors.blue(`ChatBot: ${result.finalOutput}`));
    }
}
main();