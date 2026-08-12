import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { ROUTES } from '@modules/identity/constants/routes';

export const useLogout = () => {
    const queryClient = useQueryClient();

    const logoutAction = useAuthStore((state) => state.logoutAction);

    const handleLogout = () => {
        try {
            queryClient.clear();

            logoutAction();

            sessionStorage.clear();

            window.location.href = ROUTES.LOGIN;
        } catch (error) {
            console.error("Error during authentication teardown sequence:", error);
            window.location.href = ROUTES.LOGIN;
        }
    };

    return { handleLogout };
};