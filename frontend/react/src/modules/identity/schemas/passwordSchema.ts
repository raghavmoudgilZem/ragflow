import { z } from 'zod';

export const passwordSchema = z
    .object({
        currentPassword: z
            .string()
            .min(1, 'Please input your password!'),
        newPassword: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .max(100)
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                'Password must satisfy complexity requirements (uppercase, lowercase, number, and special character)'
            ),
        confirmPassword: z
            .string()
            .min(1, 'Please confirm your password!')
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword']
    });

export type PasswordSchemaType = z.infer<typeof passwordSchema>;