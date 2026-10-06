/**
 * AgroScan AI - AgronomicChatThread Model (OOP Domain Layer).
 *
 * Encapsulates interactive follow-up message turns between the farmer and
 * the Andean agricultural extensionist (powered by Gemini 2.5 Flash),
 * grounded on a specific phytosanitary diagnostic report.
 */

import { ChatMessage } from '../types';

export class AgronomicChatThread {
  public readonly diagnosticId: string;
  public messages: ChatMessage[];
  public suggestedFollowups: string[];
  public isPending: boolean;

  constructor(
    diagnosticId: string,
    messages: ChatMessage[] = [],
    suggestedFollowups: string[] = [],
    isPending: boolean = false
  ) {
    this.diagnosticId = diagnosticId;
    this.messages = messages;
    this.suggestedFollowups = suggestedFollowups;
    this.isPending = isPending;
  }

  /**
   * Generates a storage key for thread persistence in localStorage.
   */
  private static getStorageKey(diagnosticId: string): string {
    return `agroscan_chat_thread_${diagnosticId}`;
  }

  /**
   * Loads an existing chat thread from localStorage or initializes a new one.
   */
  public static loadThread(
    diagnosticId: string,
    initialSuggestions: string[] = []
  ): AgronomicChatThread {
    try {
      const raw = localStorage.getItem(this.getStorageKey(diagnosticId));
      if (raw) {
        const parsed = JSON.parse(raw);
        return new AgronomicChatThread(
          diagnosticId,
          parsed.messages || [],
          parsed.suggestedFollowups || initialSuggestions,
          false
        );
      }
    } catch (err) {
      console.warn('Failed to load chat thread from storage:', err);
    }

    return new AgronomicChatThread(diagnosticId, [], initialSuggestions, false);
  }

  /**
   * Persists thread messages to localStorage.
   */
  public saveThread(): void {
    try {
      localStorage.setItem(
        AgronomicChatThread.getStorageKey(this.diagnosticId),
        JSON.stringify({
          diagnosticId: this.diagnosticId,
          messages: this.messages,
          suggestedFollowups: this.suggestedFollowups,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch (err) {
      console.warn('Failed to persist chat thread to storage:', err);
    }
  }

  /**
   * Appends a user inquiry message to the thread.
   */
  public addUserMessage(content: string): ChatMessage {
    const message: ChatMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };
    this.messages.push(message);
    this.isPending = true;
    this.saveThread();
    return message;
  }

  /**
   * Appends an agronomist assistant reply to the thread.
   */
  public addModelResponse(reply: string, suggestedFollowups: string[] = []): ChatMessage {
    const message: ChatMessage = {
      role: 'model',
      content: reply.trim(),
      timestamp: new Date().toISOString(),
    };
    this.messages.push(message);
    this.suggestedFollowups = suggestedFollowups;
    this.isPending = false;
    this.saveThread();
    return message;
  }

  /**
   * Clears the current thread history from local memory.
   */
  public clearThread(): void {
    this.messages = [];
    this.suggestedFollowups = [];
    this.isPending = false;
    try {
      localStorage.removeItem(AgronomicChatThread.getStorageKey(this.diagnosticId));
    } catch {
      // Ignore
    }
  }

  /**
   * Returns message history formatted for backend transmission.
   */
  public toHistoryPayload(): ChatMessage[] {
    return this.messages.map((m) => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
    }));
  }
}
