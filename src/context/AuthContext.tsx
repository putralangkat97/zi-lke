import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '../types';

interface AuthContextType {
  user: User | undefined;
  isLoading: boolean;
  switchUser: (userId: string) => void;
  isSwitching: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['me'],
    queryFn: () => fetch('/api/me').then((res) => res.json()),
  });

  const switchUserMutation = useMutation({
    mutationFn: (userId: string) =>
      fetch('/api/active-user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        switchUser: (id) => switchUserMutation.mutate(id),
        isSwitching: switchUserMutation.isPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
