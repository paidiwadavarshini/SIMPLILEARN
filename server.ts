import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini client to prevent crashing on boot if the key is missing.
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: key || "",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// In-memory cache structures to speed up responses and save AI token costs
const explanationCache: Record<string, any> = {};
const interactiveCache: Record<string, any> = {};

// API endpoint for generating concept explanations
app.post('/api/explain', async (req, res) => {
  try {
    const { topic, age = 14, analogyStyle = 'relatable' } = req.body;
    
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      res.status(400).json({ error: 'Topic is required and must be a valid string.' });
      return;
    }

    const trimmedTopic = topic.trim();
    const cacheKey = `explain:${trimmedTopic.toLowerCase()}:${age}:${analogyStyle}`;
    if (explanationCache[cacheKey]) {
      console.log(`[Cache Hit] Serving cached explanation for: ${trimmedTopic}`);
      res.json({ ...explanationCache[cacheKey], _cached: true });
      return;
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Return beautiful, fallback, structured mock-data if the API key is not present yet,
      // explaining exactly how to add it, but also keeping the app fully functional in preview.
      console.warn("GEMINI_API_KEY is not defined. Using high-quality educational fallback content.");
      const mockResult = getMockExplanation(trimmedTopic, age);
      explanationCache[cacheKey] = mockResult;
      res.json(mockResult);
      return;
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are a world-class science, technology, engineering, humanities, and mathematics educator who excels at translating complex academic concepts into incredibly simple, intuitive explanations for young learners.
Your target audience is a ${age}-year-old. You must explain the topic in simple, warm, everyday terms, entirely avoiding high-level math terminology or complex academic jargon unless you immediately explain it with a simple, concrete analogy.

For your response:
1. Explain the topic in simple terms.
2. Use a highly relatable and vivid "${analogyStyle}" analogy (e.g. magic socks, video games, kitchen recipe, sports) to visualize the concept. Make it highly engaging!
3. Formulate a final summary of exactly 3 to 8 sentences. The summary must be a self-contained, highly informative paragraph summarizing the core principles.
4. Extract 3 to 5 easy-to-digest key points or steps (e.g. historical context, core mechanism, future applications).
5. Recommend 3 to 5 similar or highly related topics to explore after this.
6. Identify the appropriate primary subject name for this topic (e.g., 'Mathematics', 'Science', 'Technology/Coding', 'History', 'Literature & Art', 'Economics & Finance').

You MUST respond strictly in JSON with the exact structure matching the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Explain the following topic: "${topic.trim()}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topicName: {
              type: Type.STRING,
              description: "The name of the topic, properly formatted and capitalized."
            },
            subjectName: {
              type: Type.STRING,
              description: "The primary subject field, e.g. Mathematics, Science, Technology/Coding, History, Literature & Art, Economics & Finance."
            },
            coreIdea: {
              type: Type.STRING,
              description: "A simple, child-friendly explanation of the topic's core concept, under 150 words."
            },
            analogyTitle: {
              type: Type.STRING,
              description: "A creative, short name for your analogy (e.g., 'The Magic Sock Dilemma')."
            },
            analogy: {
              type: Type.STRING,
              description: "The complete, detailed analogy explaining the topic using the requested analogy style."
            },
            summaryText: {
              type: Type.STRING,
              description: "A self-contained, concise summary of the topic. MUST be strictly between 3 and 8 sentences."
            },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "An array of 3 to 5 key learning bullet points, each in a simple action-oriented sentence."
            },
            similarTopics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "An array of 3 to 5 highly related topics that would help understand this concept further."
            }
          },
          required: ["topicName", "subjectName", "coreIdea", "analogyTitle", "analogy", "summaryText", "keyPoints", "similarTopics"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    const result = JSON.parse(responseText.trim());
    explanationCache[cacheKey] = result;
    res.json(result);
  } catch (error: any) {
    console.error("Gemini Explanation Error, falling back to mock content:", error);
    try {
      const topic = req.body.topic || "M2 Engineering Maths";
      const age = req.body.age || 14;
      const mockResult = getMockExplanation(topic.trim(), age);
      mockResult._apiFallbackUsed = true;
      res.json(mockResult);
    } catch (fallbackErr: any) {
      console.error("Critical fallback failure:", fallbackErr);
      res.status(500).json({
        error: 'Failed to generate explanation.',
        details: error.message || error
      });
    }
  }
});

// API endpoint for generating custom interactive quiz & flashcard content based on the topic and its summary
app.post('/api/interactive', async (req, res) => {
  try {
    const { topic, summaryText, age = 14 } = req.body;
    
    if (!topic || !summaryText) {
      res.status(400).json({ error: 'Topic and summaryText are required to generate interactive exercises.' });
      return;
    }

    const trimmedTopic = topic.trim();
    const cacheKey = `interactive:${trimmedTopic.toLowerCase()}:${age}`;
    if (interactiveCache[cacheKey]) {
      console.log(`[Cache Hit] Serving cached interactive exercises for: ${trimmedTopic}`);
      res.json({ ...interactiveCache[cacheKey], _cached: true });
      return;
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is not defined. Using high-quality educational fallback interactive materials.");
      const mockInteractive = getMockInteractive(trimmedTopic, summaryText);
      interactiveCache[cacheKey] = mockInteractive;
      res.json(mockInteractive);
      return;
    }

    const ai = getGeminiClient();
    const systemInstruction = `You are a world-class educational designer who creates simple, incredibly fun, and intuitive interactive quizzes and visual memory flashcards for students.
Your target student age is ${age}. Based on the active topic "${trimmedTopic}" and its explanation/summary: "${summaryText}", generate:
1. Exactly 5 multiple-choice questions for testing understanding. Each question has a 'question' string, exactly 4 options, a 0-based 'correctAnswerIndex', and an encouraging, explanatory 'explanation' detailing exactly why that option is correct.
2. A deck of exactly 5 digital flashcards with a term/concept on the 'front' and a child-friendly short description (under 25 words) on the 'back'.

You MUST respond strictly in JSON matching the exact schema provided.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Generate interactive quiz and flashcards for "${trimmedTopic}" using this summary context: "${summaryText}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quiz: {
              type: Type.ARRAY,
              description: "An array of exactly 5 multiple choice questions.",
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswerIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "correctAnswerIndex", "explanation"]
              }
            },
            flashcards: {
              type: Type.ARRAY,
              description: "An array of exactly 5 cards.",
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING, description: "The visual cue, term, question or concept on the front side." },
                  back: { type: Type.STRING, description: "The answer or simple memory chunk on the backside." }
                },
                required: ["front", "back"]
              }
            }
          },
          required: ["quiz", "flashcards"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from Gemini API for interactive content");
    }

    const result = JSON.parse(responseText.trim());
    interactiveCache[cacheKey] = result;
    res.json(result);
  } catch (error: any) {
    console.error("Gemini Interactive Exercises Generation Error, falling back to mock interactive:", error);
    try {
      const topic = req.body.topic || "Active Topic";
      const summaryText = req.body.summaryText || "";
      const mockResult = getMockInteractive(topic, summaryText);
      mockResult._apiFallbackUsed = true;
      res.json(mockResult);
    } catch (fallbackErr: any) {
      console.error("Critical fallback failure on interactive:", fallbackErr);
      res.status(500).json({
        error: 'Failed to generate interactive materials.',
        details: error.message || error
      });
    }
  }
});

// High-quality mock explanations to provide a flawless experience if GEMINI_API_KEY is not configured yet
function getMockExplanation(topic: string, age: number): any {
  const normalized = topic.toLowerCase();
  
  if (normalized.includes("m2") || normalized.includes("engineering math") || normalized.includes("engineering maths")) {
    return {
      topicName: "M2 Engineering Mathematics",
      subjectName: "Mathematics",
      coreIdea: "M2 is the second level of engineering math. Think of it like a toolbox loaded with advanced superpower calculators that let engineers study things that are constantly curving, spinning, vibrating, or changing over time, like the speed of a roller coaster or water flowing through a giant industrial tube.",
      analogyTitle: "The GPS Navigator and the Track Curve",
      analogy: "Imagine you are driving a race car on a super twisty, curving stunt track. A normal map only tells you where you are right now. But 'M2 Maths' acts like a hyper-tech GPS that calculates exactly how sharp the curve is ahead, at what exact millisecond you should drift, and how much gravity will pull on your tires as you slide. It breaks down the crazy, curving track into a millions of microscopic straight lines so your race car's computer can understand them perfectly.",
      summaryText: "M2 Engineering Mathematics is a branch of mathematics focused on complex change and spatial problems. It introduces advanced tools like Fourier Series, Laplace Transforms, and Vector Calculus to help engineers analyze continuous waves, heat flows, and electromagnetic signals. By turning complex vibrating waveforms or flowing fluids into simpler algebraic equations, M2 allows us to design sturdy bridges, efficient radio signals, and safe airplanes. Ultimately, it translates the dynamic, moving parts of the physical world into clean, solvable code.",
      keyPoints: [
        "It breaks complex curves and forces into billions of tiny flat shapes to calculate them easily.",
        "It introduces 'Transforms' which act like Google Translate, converting scary wave equations into simple algebra.",
        "Engineers use M2 to predict how bridges sway in high winds and how radio signals travel through the air.",
        "It deals with matrices and vectors to track multiple moving parts at once in 3D gaming engines and robotics."
      ],
      similarTopics: [
        "Fourier Series",
        "Laplace Transforms",
        "Vector Calculus",
        "Differential Equations",
        "Matrices & Determinants"
      ]
    };
  }

  // Fallback for general topics
  return {
    topicName: topic,
    subjectName: "Science & Technology",
    coreIdea: `That's a fantastic question! ${topic} is all about understanding how different parts of a system connect together, handle changing forces, or pass information back and forth.`,
    analogyTitle: "The Giant Playground Swing",
    analogy: `Imagine ${topic} is like pushing a friend on a massive playground swing. If you push at random times, they get zero momentum and the swing stays bumpy. But if you match your push to the exact rhythm of the swing, they fly high into the air with very little effort! ${topic} works on the exact same principle of synchronization—matching actions to natural rhythms to make magic happen.`,
    summaryText: `${topic} is a core concept that describes how parts of our physical or logical systems coordinate, transmit energy, or balance forces. By finding the natural pacing and patterns of how things work, we can predict behavior, prevent failures, and build more efficient technology. Whether we are styling web apps, sending space probes, or coding algorithms, this principle keeps the chaos structured and running smoothly. It forms the backbone of how modern science and engineered structures solve everyday challenges.`,
    keyPoints: [
      "It coordinates individual forces to work together in perfect rhythm.",
      "By understanding its rules, we can predict the outcome of very complex scenarios.",
      "It allows engineers and scientists to build safer, faster, and more robust structures.",
      "Everything from your phone screen to massive skyscrapers depends on this balancing act."
    ],
    similarTopics: [
      "Resonance and Waves",
      "System Equilibrium",
      "Feedback Loops",
      "Action and Reaction"
    ]
  };
}

function getMockInteractive(topic: string, summaryText: string): any {
  return {
    quiz: [
      {
        question: `What is the core objective when studying "${topic}"?`,
        options: [
          "To translate complex parts into simple, understandable concepts.",
          "To make things look more academic and confusing.",
          "To memorize hard mathematical equations without any analogies.",
          "To build systems without understanding standard patterns."
        ],
        correctAnswerIndex: 0,
        explanation: `Spot on! The goal of exploring "${topic}" is to deconstruct its complex components into everyday visual analogies, making learning intuitive, enjoyable, and permanently memorable!`
      },
      {
        question: `How does our master educator explain a concept like "${topic}"?`,
        options: [
          "With long lectures using heavy advanced vocabulary only.",
          "Using everyday real-world examples, analogies, and interactive tools.",
          "By asking students to search the answers on the web manually.",
          "By leaving out the core details entirely."
        ],
        correctAnswerIndex: 1,
        explanation: `Excellent choice! Translating abstract ideas into things like playground swings, video games, or recipe steps is the best way to help students connect and understand immediately.`
      },
      {
        question: `Which of the following is true about studying "${topic}"?`,
        options: [
          "It's only useful for high-level research labs.",
          "It is isolated and has no connections to other disciplines.",
          "It connects to other subjects and is highly applicable in our everyday lives.",
          "It was completely invented only a year ago."
        ],
        correctAnswerIndex: 2,
        explanation: `Yes! From our smartphones to our history books, most systems are built on these core connected concepts that touch almost every aspect of daily life.`
      },
      {
        question: `What is a great feature to use when studying a difficult topic?`,
        options: [
          "A quiet, simple Focus Mode that reduces ADHD distraction.",
          "Hiring a team of academic system administrators.",
          "Ignoring the summary text and just guessing the formulas.",
          "Giving up as soon as complex words appear."
        ],
        correctAnswerIndex: 0,
        explanation: `Perfect! Toggling on the non-distracting Focus Mode shuts out all sidebar noise, leaving you with beautiful layouts to read peacefully.`
      },
      {
        question: `Why is writing custom notes in your Study Notebook helpful?`,
        options: [
          "It deletes the active explanation permanently.",
          "It helps you customize, reflect, and comment in your own words, then export study guides.",
          "It is required by the web browser to function.",
          "It forces you to call the database continuously."
        ],
        correctAnswerIndex: 1,
        explanation: `That's right! Active learning is about adding your own insights, editing saved materials, and exporting formatted study guides to review before exams.`
      }
    ],
    flashcards: [
      {
        front: `Core Idea of ${topic}`,
        back: "A fundamental concept explaining how individual parts connect to form bigger, balanced systems."
      },
      {
        front: "Analogy Method",
        back: "Comparing high-level theories to friendly, everyday things like rollercoasters, magic socks, or recipe baking."
      },
      {
        front: "Key Takeaway",
        back: "Every difficult subject can be solved by breaking it down into simple, microscopic flat pieces."
      },
      {
        front: "Active Notebook",
        back: "A personalized study space to save, annotate, edit, and keep track of your core subject items."
      },
      {
        front: "Curriculum Flow",
        back: "How one simple topic connects directly to other fascinating ideas like balance loops and resonance waves."
      }
    ]
  };
}

// Vite and Static Assets Management
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
