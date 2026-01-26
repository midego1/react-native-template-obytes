import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import * as React from 'react';
import { ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import {
  useAddReaction,
  useMessageReactions,
  useRemoveReaction,
} from '../use-message-reactions';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

describe('message Reactions', () => {
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

  describe('useMessageReactions', () => {
    it('should fetch reactions for a message', async () => {
      const mockReactions = [
        {
          id: 'react-1',
          message_id: 'msg-123',
          user_id: 'user-456',
          emoji: '👍',
          created_at: '2024-01-01T00:00:00Z',
          user: {
            id: 'user-456',
            full_name: 'John Doe',
            avatar_url: 'https://example.com/avatar.jpg',
          },
        },
        {
          id: 'react-2',
          message_id: 'msg-123',
          user_id: 'user-789',
          emoji: '❤️',
          created_at: '2024-01-01T00:01:00Z',
          user: {
            id: 'user-789',
            full_name: 'Jane Smith',
            avatar_url: 'https://example.com/avatar2.jpg',
          },
        },
      ];

      const mockOrder = jest.fn().mockResolvedValue({
        data: mockReactions,
        error: null,
      });

      const mockEq = jest.fn().mockReturnValue({
        order: mockOrder,
      });

      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const { result } = renderHook(() => useMessageReactions('msg-123'), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockReactions);
      expect(mockEq).toHaveBeenCalledWith('message_id', 'msg-123');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: true });
    });
  });

  describe('useAddReaction', () => {
    it('should add reaction to message', async () => {
      const mockUser = { id: 'user-123' };
      const mockReaction = {
        id: 'react-123',
        message_id: 'msg-456',
        user_id: 'user-123',
        emoji: '👍',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockReaction,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      });

      const { result } = renderHook(() => useAddReaction(), { wrapper });

      result.current.mutate({
        messageId: 'msg-456',
        emoji: '👍',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockInsert).toHaveBeenCalledWith({
        message_id: 'msg-456',
        user_id: 'user-123',
        emoji: '👍',
      });

      expect(result.current.data).toEqual(mockReaction);
    });

    it('should prevent duplicate reactions', async () => {
      const mockUser = { id: 'user-123' };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: '23505', message: 'Duplicate key' },
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      });

      const { result } = renderHook(() => useAddReaction(), { wrapper });

      result.current.mutate({
        messageId: 'msg-456',
        emoji: '👍',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(
        new Error('Already reacted with this emoji'),
      );
    });

    it('should require authentication', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const { result } = renderHook(() => useAddReaction(), { wrapper });

      result.current.mutate({
        messageId: 'msg-456',
        emoji: '👍',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(new Error('Must be logged in'));
    });
  });

  describe('useRemoveReaction', () => {
    it('should remove reaction from message', async () => {
      const mockUser = { id: 'user-123' };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockEq3 = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockEq2 = jest.fn().mockReturnValue({
        eq: mockEq3,
      });

      const mockEq1 = jest.fn().mockReturnValue({
        eq: mockEq2,
      });

      const mockDelete = jest.fn().mockReturnValue({
        eq: mockEq1,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        delete: mockDelete,
      });

      const { result } = renderHook(() => useRemoveReaction(), { wrapper });

      result.current.mutate({
        messageId: 'msg-456',
        emoji: '👍',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockDelete).toHaveBeenCalled();
      // Verify all three eq calls were made with correct parameters
      expect(mockEq1).toHaveBeenCalledWith('message_id', 'msg-456');
      expect(mockEq2).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockEq3).toHaveBeenCalledWith('emoji', '👍');
    });

    it('should require authentication', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const { result } = renderHook(() => useRemoveReaction(), { wrapper });

      result.current.mutate({
        messageId: 'msg-456',
        emoji: '👍',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(new Error('Must be logged in'));
    });
  });
});
