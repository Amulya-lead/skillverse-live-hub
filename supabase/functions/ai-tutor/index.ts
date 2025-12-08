import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not set');
    }

    const systemPrompt = `You are an expert AI programming tutor for SkillVerse, an online learning platform. Your role is to help students master programming concepts.

CURRENT SESSION: ${context || 'General programming assistance'}

YOUR TEACHING STYLE:
- Break down complex concepts into digestible pieces
- Use analogies and real-world examples
- Provide working code examples when helpful
- Be encouraging and patient
- Ask clarifying questions when needed

RESPONSE GUIDELINES:
1. For code explanations: Walk through line by line
2. For debugging: Help identify the issue, explain why it happens, show the fix
3. For concepts: Start simple, then add complexity
4. For best practices: Explain the "why" behind recommendations

Keep responses focused and practical. Use markdown for code blocks.
If asked about non-programming topics, gently guide back to learning.

Be conversational, friendly, and supportive. Use emojis sparingly for encouragement.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          reply: "I'm getting a lot of questions right now! Please wait a moment and try again. 🙏" 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again.";

    console.log('AI Tutor response generated successfully');

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in ai-tutor function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      reply: "I'm having a moment! Please try your question again. 💭",
      error: errorMessage 
    }), {
      status: 200, // Return 200 with fallback message instead of error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
