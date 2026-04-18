import type { AssistantResolution, IssueCategory } from '../models/types';
import { demoAssistantResolution } from '../data/demoTrip';

export interface AssistantService {
  getSuggestions(issue: IssueCategory): Promise<AssistantResolution>;
  resolveIssue(issue: IssueCategory): Promise<AssistantResolution>;
}

function cloneResolution(resolution: AssistantResolution): AssistantResolution {
  return {
    ...resolution,
    suggestions: resolution.suggestions.map((s) => ({ ...s })),
  };
}

export function createMockAssistantService(): AssistantService {
  return {
    async getSuggestions() {
      return cloneResolution(demoAssistantResolution());
    },
    async resolveIssue() {
      return cloneResolution(demoAssistantResolution());
    },
  };
}
