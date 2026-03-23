const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

async function generateResponse(prompt) {
  
    const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    });

  return response.text;
}



module.exports=generateResponse;