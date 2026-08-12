/**
 * @author Shruthi
 * @description React Query mutation — update (rename) an existing dataset.
 *
 *              onSuccess: invalidates the specific list cache so the
 *                         updated name reflects immediately.
 *              onError:   surfaces the API error via notification toast.
 *                         Dialog stays open so the user can retry.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DatasetKeys } from '../../utils/datasetKeys';
import { datasetApi } from '../../api/datasetService';
import { notifyError } from '@shared/api/notification';
import type { IUpdateDatasetPayload } from '../../types/dataset.types';

export const useUpdateDataset = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: IUpdateDatasetPayload) => datasetApi.update(payload),

        onSuccess: (): void => {
            // Invalidate the full list — simpler than tracking individual
            // detail keys since the mock has no GET /kb/:id endpoint yet
            queryClient.invalidateQueries({ queryKey: DatasetKeys.lists() });
        },

        onError: (error: Error): void => {
            notifyError({
                message:     'Failed to update dataset',
                description: error.message ?? 'Something went wrong. Please try again.',
            });
        },
    });
};