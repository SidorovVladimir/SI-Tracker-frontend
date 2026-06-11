import { useQuery } from '@apollo/client/react';
import { GetMeDocument } from '../graphql/types/__generated__/graphql';

export const useAuth = () => {
  const { data, loading, error } = useQuery(GetMeDocument, {
    fetchPolicy: 'cache-and-network',
  });

  return {
    isAuthenticated: !!data?.me,
    isLoading: loading,
    user: data?.me,
    error,
  };
};
