// Mock AI response generator
export async function POST(req: Request) {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];
    const prompt = lastMessage.content.toLowerCase();

    // Simulate latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    let responseText = "I'm the Startup Scout AI. I can help you find companies, analyze trends, or compare startups. Try asking 'Show me fintech startups' or 'Compare AI companies'.";

    if (prompt.includes('fintech') || prompt.includes('financial')) {
        responseText = "Here are some trending **FinTech** startups I found based on your criteria:\n\n" +
            "1. **Stripe** (Payments) - Series E\n" +
            "2. **Plaid** (Infrastructure) - Series C\n" +
            "3. **Revolut** (Banking) - Series D\n\n" +
            "Would you like to see a detailed comparison?";
    } else if (prompt.includes('ai') || prompt.includes('ml')) {
        responseText = "I found several high-growth **AI** companies:\n\n" +
            "1. **OpenAI** (Generative AI) - Late Stage\n" +
            "2. **Anthropic** (Safety) - Series B\n" +
            "3. **Scale AI** (Data) - Series D";
    } else if (prompt.includes('compare')) {
        responseText = "I've generated a comparison table for the selected startups. You can view funding rounds, employee growth, and market sentiment side-by-side above.";
    }

    // Return a simple text response for the useChat hook
    // usage of stream is optional in useChat if we handle onFinish etc, but standard fetch works too.
    // Ideally we should stream, but for mock, a single response is fine using the SDK's expected format.
    // The SDK expects a stream or a string.

    return new Response(responseText);
}
