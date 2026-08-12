import type { AxiosResponse } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { unwrapEnvelope } from '@shared/api/envelope';
import type { ApiResponse } from '@shared/api/envelope';
import { documentApi } from '../api/documentApi';
import { documentKeys } from '../api/documentKeys';
import type { DocumentDetail } from '../types/chunk.types';

export function useDocumentDetail(documentId: string | undefined) {
  return useQuery<AxiosResponse<ApiResponse<DocumentDetail>>, Error, DocumentDetail>({
    queryKey: documentId ? documentKeys.detail(documentId) : [],
    enabled: Boolean(documentId),
    staleTime: 30_000,
    queryFn: () => documentApi.getDocument(documentId!),
    select: (response) => unwrapEnvelope(response.data),
  });
}
