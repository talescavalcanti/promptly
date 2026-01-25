const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

const fs = require('fs');

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        fs.writeFileSync('scripts/models_list.txt', "No GEMINI_API_KEY found");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        let output = "Available Models:\n";
        if (data.models) {
            data.models.forEach(m => {
                output += `- ${m.name} (${m.displayName})\n`;
            });
        } else {
            output += "No models returned. Response: " + JSON.stringify(data, null, 2);
        }
        fs.writeFileSync('scripts/models_list.txt', output);
        console.log("Model list written to scripts/models_list.txt");

    } catch (error) {
        fs.writeFileSync('scripts/models_list.txt', "Error: " + error.toString());
    }
}

listModels();
