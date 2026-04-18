import type { AssistantResolution, IssueCategory } from '../models/types';
import { mockAssistantResolution } from '../utils/mockData';

export interface AssistantService {
  getSuggestions(issue: IssueCategory): Promise<AssistantResolution>;
  resolveIssue(issue: IssueCategory): Promise<AssistantResolution>;
}

export function createMockAssistantService(): AssistantService {
  const resolution = mockAssistantResolution();
  return {
    async getSuggestions() {
      return { ...resolution, suggestions: resolution.suggestions.map((s) => ({ ...s })) };
    },
    async resolveIssue() {
      return { ...resolution, suggestions: resolution.suggestions.map((s) => ({ ...s })) };
    },
  };
}
