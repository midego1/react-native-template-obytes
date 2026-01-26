import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import * as React from 'react';
import { ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useSendMessage } from '../use-send-message';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

describe('useSendMessage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should send a text message successfully', async () => {
    const mockUser = { id: 'user-123' };
    const mockMessage = {
      id: 'msg-123',
      conversation_id: 'conv-123',
      sender_id: 'user-123',
      content: 'Hello',
      type: 'text',
      status: 'sent',
    };

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: mockMessage,
          error: null,
        }),
      }),
    });

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'messages') {
        return { insert: mockInsert };
      }
      if (table === 'conversations') {
        return { update: mockUpdate };
      }
    });

    const { result } = renderHook(() => useSendMessage(), { wrapper });

    result.current.mutate({
      conversationId: 'conv-123',
      content: 'Hello',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockInsert).toHaveBeenCalledWith({
      conversation_id: 'conv-123',
      sender_id: 'user-123',
      content: 'Hello',
      type: 'text',
      media_url: undefined,
      media_type: undefined,
      file_name: undefined,
      file_size: undefined,
      thumbnail_url: undefined,
      duration: undefined,
      reply_to_message_id: undefined,
      status: 'sent',
    });

    expect(result.current.data).toEqual(mockMessage);
  });

  it('should send an image message', async () => {
    const mockUser = { id: 'user-123' };

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { id: 'msg-123' },
          error: null,
        }),
      }),
    });

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: null, error: null }),
    });

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'messages')
        return { insert: mockInsert };
      if (table === 'conversations')
        return { update: mockUpdate };
    });

    const { result } = renderHook(() => useSendMessage(), { wrapper });

    result.current.mutate({
      conversationId: 'conv-123',
      content: 'Image',
      type: 'image',
      mediaUrl: 'https://example.com/image.jpg',
      mediaType: 'image/jpeg',
      fileName: 'photo.jpg',
      fileSize: 12345,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'image',
        media_url: 'https://example.com/image.jpg',
        media_type: 'image/jpeg',
        file_name: 'photo.jpg',
        file_size: 12345,
      }),
    );
  });

  it('should handle authentication error', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    });

    const { result } = renderHook(() => useSendMessage(), { wrapper });

    result.current.mutate({
      conversationId: 'conv-123',
      content: 'Hello',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(new Error('Must be logged in'));
  });

  it('should handle send failure', async () => {
    const mockUser = { id: 'user-123' };

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    });

    const { result } = renderHook(() => useSendMessage(), { wrapper });

    result.current.mutate({
      conversationId: 'conv-123',
      content: 'Hello',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(
      new Error('Failed to send message: Database error'),
    );
  });
});
