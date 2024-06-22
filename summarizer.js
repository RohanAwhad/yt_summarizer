const SummaryType = {
  PHILOSOPHICAL_ANALYSIS: "Philosophical Analysis Summary",
  TECHNICAL_PRACTICAL: "Technical and Practical Summary",
  STRATEGIC_BUSINESS: "Strategic Business Summary",
  INNOVATIVE_VISIONARY: "Innovative and Visionary Summary",
  COMPREHENSIVE_GENERAL: "Comprehensive General Summary"
};

function getPodcastSummaryPrompt(summaryType) {
    const prompts = {
        [SummaryType.PHILOSOPHICAL_ANALYSIS]: `
        Please summarize this video transcript with a focus on the following key points, responding in a structured format using bullet or numbered points whenever possible, and present the summary in markdown format:
        1. **Central Arguments**: Extract the main arguments or hypotheses discussed.
        2. **Contextual Significance**: Highlight the broader context or significance of the topics covered.
        3. **Philosophical Underpinnings**: Identify any philosophical or theoretical foundations underlying the discussion.
        4. **Critical Analysis**: Include a critical analysis of the viewpoints presented.
        5. **Practical Implications**: Emphasize the practical implications or applications of the ideas discussed.
        6. **Narrative and Storytelling**: Pay attention to the narrative or storytelling elements used.
        7. **Speaker’s Intentions and Emotions**: Capture the intentions and emotions of the speakers.
        8. **Synthesis of Diverse Perspectives**: Synthesize the diverse perspectives presented.
        `,
        [SummaryType.TECHNICAL_PRACTICAL]: `
        Please summarize this video transcript with a focus on the following key points, responding in a structured format using bullet or numbered points whenever possible, and present the summary in markdown format:
        1. **Technical Insights**: Emphasize the extraction of technical details and innovations discussed.
        2. **Practical Applications**: Focus on the practical applications and real-world use cases of the concepts discussed.
        3. **Problem-Solving Approaches**: Capture different problem-solving approaches and strategies mentioned by the speakers.
        4. **Key Learnings and Hacks**: Identify and extract key learnings or 'hacks' that can provide immediate value.
        5. **Innovative Thinking**: Highlight any unconventional or innovative ways of thinking presented.
        6. **Personal Experiences and Anecdotes**: Include personal experiences or anecdotes shared by the speakers.
        7. **Critical and Skeptical Views**: Present any critical or skeptical views expressed about mainstream ideas.
        8. **Dynamic and Fast-Paced Nature**: Reflect the dynamic and fast-paced nature of the conversation, if applicable.
        `,
        [SummaryType.STRATEGIC_BUSINESS]: `
        Please summarize this video transcript with a focus on the following key points, responding in a structured format using bullet or numbered points whenever possible, and present the summary in markdown format:
        1. **Key Business Insights**: Extract actionable business insights and strategic advice.
        2. **Innovation and Future Trends**: Emphasize innovative ideas and future trends discussed.
        3. **Customer Focus**: Capture any customer-centric strategies or insights.
        4. **Leadership and Management**: Extract key takeaways on leadership and management practices.
        5. **Data-Driven Decisions**: Focus on the importance of data-driven decision-making.
        6. **Efficiency and Scalability**: Identify discussions on operational efficiency and scalability.
        7. **Risk Management**: Summarize points related to identifying and managing risks.
        8. **Long-Term Vision**: Reflect on the importance of having a long-term vision and planning for the future.
        `,
        [SummaryType.INNOVATIVE_VISIONARY]: `
        Please summarize this video transcript with a focus on the following key points, responding in a structured format using bullet or numbered points whenever possible, and present the summary in markdown format:
        1. **Cutting-Edge Innovations**: Highlight discussions on breakthrough technologies and innovative ideas.
        2. **Visionary Goals**: Capture the long-term vision and ambitious goals discussed.
        3. **Technical Feasibility and Challenges**: Identify technical details and the feasibility of proposed ideas.
        4. **Impact on Humanity**: Emphasize the broader impact of the technologies and ideas on humanity.
        5. **Entrepreneurial Insights**: Extract key entrepreneurial lessons and insights.
        6. **Interdisciplinary Approaches**: Capture the integration of various fields of knowledge.
        7. **Risk-Taking and Resilience**: Highlight the importance of risk-taking and resilience.
        8. **Future Trends and Predictions**: Emphasize predictions about future trends and technologies.
        `,
        [SummaryType.COMPREHENSIVE_GENERAL]: `
        Please summarize this video transcript with a focus on the following key points, responding in a structured format using bullet or numbered points whenever possible, and present the summary in markdown format:
        1. **Main Topics and Themes**: Identify the primary subjects discussed and capture overarching themes.
        2. **Important Details and Facts**: Extract significant facts, statistics, or data points mentioned.
        3. **Key Speakers and Quotes**: Note the names and roles of the speakers and include memorable or impactful quotes.
        4. **Episode Structure**: Break down the video into sections or segments and summarize the main points of each section.
        5. **Context and Background Information**: Provide necessary context and background information on the topics.
        6. **Conclusion and Takeaways**: Summarize the conclusions or final thoughts and highlight actionable takeaways or recommendations.
        7. **Tone and Style**: Capture the tone and style of the video to preserve the original feel of the content.
        `
    };
  
    return prompts[summaryType] || "Prompt not found for the given name.";
}

async function generateSummary(prompt, transcriptText, apiKey, updateUI) {
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  const requestBody = {
      model: 'gpt-3.5-turbo',
      messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: transcriptText },
          { role: 'assistant', content: '```markdown\n'}
      ],
      max_tokens: 1024,
      stream: true,  // Enable streaming
      stop: ['```']
  };

  try {
      console.log('Generating summary...');
      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let summary = '';

      while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');
          for (const line of lines) {
              let formattedLine = line;

              if (formattedLine.startsWith('data: ')) { formattedLine = formattedLine.replace('data: ', ''); }
              if (formattedLine.startsWith('[DONE]')) {
                console.log('Summary generation completed.');
                return summary;
              }

              const parsedLine = JSON.parse(formattedLine);
              if (parsedLine.choices) {
                  const deltaContent = parsedLine.choices[0].delta.content || '';
                  summary += deltaContent;
                  updateUI(summary);
              }
          }
      }
      
      return summary;
  } catch (error) {
      console.error('Error generating summary:', error);
      return null;
  }
}
