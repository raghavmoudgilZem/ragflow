import { z } from 'zod';

const isValidTimezone = (tz: string): boolean => {
    try {
        Intl.DateTimeFormat(undefined, { timeZone: tz });
        return true;
    } catch {
        return false;
    }
};

export const profileSchema = z.object({
    nickname: z.string().trim().min(3, 'Name must be at least 3 characters').max(50, 'Name cannot exceed 50 characters'),
    avatar: z.string().url('Invalid URL format').optional().or(z.literal('')),
    timezone: z.string().min(1, 'Please select a timezone').refine(isValidTimezone, {
        message: 'Invalid IANA timezone selected',
    }),
});

export type ProfileSchemaInput = z.infer<typeof profileSchema>;