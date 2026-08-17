import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function UserSwitcher({ currentUser }: { currentUser: any }) {
  const queryClient = useQueryClient();
  
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(res => res.json())
  });

  const switchUser = useMutation({
    mutationFn: (userId: string) => fetch('/api/active-user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries();
    }
  });

  if (!users) return null;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-gray-500 uppercase">Dev: Switch User</label>
      <select 
        className="w-full text-sm border-gray-300 rounded-md shadow-sm"
        value={currentUser?.id || ''}
        onChange={(e) => switchUser.mutate(e.target.value)}
        disabled={switchUser.isPending}
      >
        {users.map((u: any) => (
          <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
        ))}
      </select>
    </div>
  );
}
