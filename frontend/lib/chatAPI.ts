export async function getBotReply(message: string): Promise<{
  reply: string;
  age?: number;
  bio?: string;
  tokensUsed?: number;
}> {
  try {
    console.log("Raw user message:", message);

    // Extract age from input
    const agePattern = /(?:I\s*['’]?\s*(?:am|m)|my\s*age\s*is|age\s*is|age)\s*(\d{1,3})/i;
    const ageMatch = message.match(agePattern);
    const age = ageMatch ? parseInt(ageMatch[1]) : undefined;
    console.log("ageMatch:", ageMatch);
    console.log("Extracted age:", age);

    // Extract bio from input
    let bio: string | undefined = undefined;
    let cleaned = message.replace(agePattern, '').trim();
    console.log("Cleaned message (for bio):", cleaned);
    if (cleaned.length > 5) bio = cleaned;
    console.log("Extracted bio:", bio);

    // Get assistant's reply
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: "You're a friendly assistant. Respond casually and helpfully.",
          },
          { role: 'user', content: message },
        ],
      }),
    });

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || '';
    let totalTokens = data.usage?.total_tokens || 0;

    // Rephrase bio if it exists
    let cleanedBio = bio;
    if (bio) {
      const rephraseRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an assistant that rewrites personal bios to be clear and natural.',
            },
            {
              role: 'user',
              content: `Rewrite this personal bio in a friendly tone: "${bio}"`,
            },
          ],
        }),
      });

      const rephraseData = await rephraseRes.json();
      cleanedBio = rephraseData.choices?.[0]?.message?.content?.trim() || bio;
      totalTokens += rephraseData.usage?.total_tokens || 0;
      console.log("🧽 Rephrased bio:", cleanedBio);
    }

    return {
      reply,
      age,
      bio: cleanedBio,
      tokensUsed: totalTokens,
    };
  } catch (err) {
    console.error('OpenAI error:', err);
    return { reply: 'Sorry, something went wrong.' };
  }
}
