/**
 * @author Shruthi
 * @description React Query mutation — delete a single dataset.
 *
 *              onSuccess: invalidates all list cache so the deleted card
 *                         disappears immediately.
 *              onError:   surfaces the API error via notification toast.
 *                         Confirmation dialog stays open so the user
 *                         is aware the deletion did not go through.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DatasetKeys } from '../../utils/datasetKeys';
import { datasetApi } from '../../api/datasetService';
import { notifyError } from '@shared/api/notification';

export const useDeleteDataset = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => datasetApi.remove(id),

        onSuccess: (): void => {
            queryClient.invalidateQueries({ queryKey: DatasetKeys.lists() });
            queryClient.invalidateQueries({ queryKey: DatasetKeys.owners() });
        },

        onError: (error: Error): void => {
            notifyError({
                message:     'Failed to delete dataset',
                description: error.message ?? 'Something went wrong. Please try again.',
            });
        },
    });
};