/**
 * Suggestion Prompt Builder
 */

export interface SuggestionPromptInput {
  job: {
    id: string;
    title: string;
    description: string;
    requirements: string | null;
    complexity: string | null;
    budget: number | null;
  };
  applications: Array<{
    id: string;
    applicant: {
      id: string;
      name: string;
      twitterHandle: string | null;
      skills: string[];
    };
    coverLetter: string | null;
    profileSummary: string | null;
  }>;
}

export function buildSuggestionPrompt(input: SuggestionPromptInput): string {
  const { job, applications } = input;

  const canUseXAI = job.complexity === "SIMPLE";

  return `# Recommend the Best Candidate for This Job

## JOB POSTING

**ID:** ${job.id}
**Title:** ${job.title}
**Complexity:** ${job.complexity || "Not specified"}
**Budget:** ${job.budget ? `$${job.budget}` : "Not specified"}

**Description:**
${job.description}

${job.requirements ? `**Requirements:**\n${job.requirements}\n` : ""}

---

## APPLICANTS (${applications.length} total)

${
  applications.length === 0
    ? "No applicants have applied yet."
    : applications
        .map(
          (app, i) => `
### ${i + 1}. ${app.applicant.name} (@${app.applicant.twitterHandle || "unknown"})
**Applicant ID:** ${app.applicant.id}
**Skills:** ${app.applicant.skills.join(", ") || "None listed"}

${app.coverLetter ? `**Cover Letter:**\n${app.coverLetter}\n` : ""}

**Profile Summary:**
${app.profileSummary || "Not yet analyzed"}
`
        )
        .join("\n---\n")
}

---

${
  canUseXAI
    ? `## xAI AUTOMATION OPTION

This job is marked as **SIMPLE** complexity, which means xAI automation is eligible.

**xAI Capabilities:**
- Automated data entry, scraping, and processing
- Simple API integrations
- Basic content moderation
- Repetitive administrative tasks
- Faster execution than humans
- Lower cost than human applicants
- 24/7 availability

**Consider xAI if:**
- The task is fully automatable
- No creative or strategic thinking needed
- Speed and reliability are priorities
- Cost-effectiveness matters

**Prefer human applicants if:**
- Task needs judgment or creativity
- Quality/nuance is critical
- Budget allows for human expertise
- Applicants offer exceptional value

---
`
    : ""
}

# Your Recommendation

Analyze all options and recommend the best choice.

${
  applications.length === 0
    ? `Since there are no applicants, ${canUseXAI ? "recommend xAI if appropriate, or explain that no good option exists" : "explain that hiring cannot proceed"}.`
    : `Rank the applicants, ${canUseXAI ? "compare to xAI automation, " : ""}and recommend the best choice.`
}

Output your recommendation as valid JSON following the schema in your system prompt.`;
}
