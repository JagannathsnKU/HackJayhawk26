import type { AssistantResolution, IssueCategory } from '../models/types';
import { mockAssistantResolution } from '../utils/mockData';
import { backendFetch } from './apiClient';

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

export function createApiAssistantService(): AssistantService {
  async function fetchTripContext(): Promise<string> {
    try {
      const res = await backendFetch('/convai/tool/get_trip_context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) return '';
      const data = (await res.json()) as Record<string, unknown>;
      return (data.result as string) ?? '';
    } catch {
      return '';
    }
  }

  async function buildResolution(issue: IssueCategory): Promise<AssistantResolution> {
    const context = await fetchTripContext();
    const message = context || `Assistant ready to help with ${issue} issue.`;
    return {
      message,
      suggestions: [
        { id: 'ctx-1', title: 'Trip summary', summary: context || 'No active trip context found.' },
        { id: 'ctx-2', title: 'Emergency loan', summary: 'Request funds via XRPL lending protocol.' },
        { id: 'ctx-3', title: 'Verify identity', summary: 'Sign a Verifiable Presentation with your XLS-40 DID.' },
      ],
    };
  }

  return {
    async getSuggestions(issue) {
      return buildResolution(issue);
    },
    async resolveIssue(issue) {
      return buildResolution(issue);
    },
  };
}
