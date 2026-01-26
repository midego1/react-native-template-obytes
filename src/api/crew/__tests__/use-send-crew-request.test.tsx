import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import * as React from 'react';
import { ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useSendCrewRequest } from '../use-send-crew-request';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

describe('useSendCrewRequest', () => {
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

  it('should send crew request successfully', async () => {
    const mockUser = { id: 'user-123' };
    const mockRequest = {
      id: 'req-123',
      requester_id: 'user-123',
      addressee_id: 'user-456',
      status: 'pending',
    };

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const mockSelect = jest.fn().mockReturnValue({
      or: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    });

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: mockRequest,
          error: null,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'crew_connections') {
        const mockFrom = {
          select: mockSelect,
          insert: mockInsert,
        };
        // First call for checking existing connection
        if (!mockSelect.mock.calls.length) {
          return mockFrom;
        }
        // Second call for inserting
        return mockFrom;
      }
    });

    const { result } = renderHook(() => useSendCrewRequest(), { wrapper });

    result.current.mutate('user-456');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockInsert).toHaveBeenCalledWith({
      requester_id: 'user-123',
      addressee_id: 'user-456',
      status: 'pending',
    });

    expect(result.current.data).toEqual(mockRequest);
  });

  it('should prevent duplicate request', async () => {
    const mockUser = { id: 'user-123' };

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const mockSelect = jest.fn().mockReturnValue({
      or: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { id: 'existing-123', status: 'pending' },
          error: null,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    const { result } = renderHook(() => useSendCrewRequest(), { wrapper });

    result.current.mutate('user-456');

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(new Error('Request already sent'));
  });

  it('should prevent request to already connected user', async () => {
    const mockUser = { id: 'user-123' };

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const mockSelect = jest.fn().mockReturnValue({
      or: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { id: 'existing-123', status: 'accepted' },
          error: null,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    const { result } = renderHook(() => useSendCrewRequest(), { wrapper });

    result.current.mutate('user-456');

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(new Error('Already connected'));
  });

  it('should require authentication', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    });

    const { result } = renderHook(() => useSendCrewRequest(), { wrapper });

    result.current.mutate('user-456');

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(new Error('Must be logged in'));
  });
});
