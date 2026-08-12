/**
 * @author Shruthi
 * @description React Query mutation — create a new dataset.
 *
 *              onSuccess: invalidates all list + owners cache so the
 *                         new card appears immediately.
 *              onError:   surfaces the API error message via the shared
 *                         notification pattern (toast). Dialog stays open
 *                         so the user can correct and retry.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DatasetKeys } from '../../utils/datasetKeys';
import { datasetApi } from '../../api/datasetService';
import { notifyError } from '@shared/api/notification';
import type { ICreateDatasetPayload } from '../../types/dataset.types';

export const useCreateDataset = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: ICreateDatasetPayload) => datasetApi.create(payload),

        onSuccess: (): void => {
            queryClient.invalidateQueries({ queryKey: DatasetKeys.lists() });
            queryClient.invalidateQueries({ queryKey: DatasetKeys.owners() });
        },

        onError: (error: Error): void => {
            notifyError({
                message:     'Failed to create dataset',
                description: error.message || 'Something went wrong. Please try again.',
            });
        },
    });
};