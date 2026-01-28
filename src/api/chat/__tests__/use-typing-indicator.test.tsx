import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import * as React from 'react';
import { ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import {
  useClearTyping,
  useSetTyping,
  useTypingIndicators,
} from '../use-typing-indicator';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

describe('typing Indicators', () => {
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

  describe('useSetTyping', () => {
    it('should set typing status', async () => {
      const mockUser = { id: 'user-123' };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockUpsert = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        upsert: mockUpsert,
      });

      const { result } = renderHook(() => useSetTyping(), { wrapper });

      result.current.mutate('conv-123');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockUpsert).toHaveBeenCalledWith(
        {
          conversation_id: 'conv-123',
          user_id: 'user-123',
          started_at: expect.any(String),
        },
        {
          onConflict: 'conversation_id,user_id',
        },
      );
    });

    it('should require authentication', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const { result } = renderHook(() => useSetTyping(), { wrapper });

      result.current.mutate('conv-123');

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(new Error('Must be logged in'));
    });
  });

  describe('useClearTyping', () => {
    it('should clear typing status', async () => {
      const mockUser = { id: 'user-123' };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        delete: mockDelete,
      });

      const { result } = renderHook(() => useClearTyping(), { wrapper });

      result.current.mutate('conv-123');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockDelete).toHaveBeenCalled();
    });
  });

  describe('useTypingIndicators', () => {
    it('should fetch typing indicators excluding current user', async () => {
      const mockUser = { id: 'user-123' };
      const mockIndicators = [
        {
          conversation_id: 'conv-123',
          user_id: 'user-456',
          started_at: new Date().toISOString(),
          user: {
            id: 'user-456',
            full_name: 'John Doe',
            avatar_url: 'https://example.com/avatar.jpg',
          },
        },
      ];

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockGte = jest.fn().mockResolvedValue({
        data: mockIndicators,
        error: null,
      });

      const mockNeq = jest.fn().mockReturnValue({
        gte: mockGte,
      });

      const mockEq = jest.fn().mockReturnValue({
        neq: mockNeq,
      });

      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const { result } = renderHook(() => useTypingIndicators('conv-123'), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockIndicators);
      expect(mockNeq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    it('should return empty array when not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const { result } = renderHook(() => useTypingIndicators('conv-123'), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
    });
  });
});
