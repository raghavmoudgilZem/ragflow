import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ProfileSettingPage } from './ProfileSettingPage';
import { useAuth } from '../hooks/useAuth';

vi.mock('../hooks/useAuth');
const mockedUseAuth = vi.mocked(useAuth);

vi.mock('../components/CropImageModal', () => ({
    CropImageModal: ({ open, onConfirm }: any) => {
        if (!open) return null;
        return (
            <div data-testid="crop-modal">
                <button
                    data-testid="confirm-crop-btn"
                    onClick={() => onConfirm(new File(['cropped'], 'cropped.png', { type: 'image/png' }))}
                >
                    Confirm Crop
                </button>
            </div>
        );
    }
}));

describe('ProfileSettingPage Component', () => {
    const mockUpdateNickname = vi.fn();
    const mockUpdateTimezone = vi.fn();
    const mockUpdateAvatar = vi.fn();
    const mockUpdatePassword = vi.fn();

    const defaultAuthValues = {
        user: { id: 'usr-veera-123', email: 'veerababu.musamalla@zemosolabs.com' },
        tenantId: 'tn-01',
        isAuthenticated: true,
        roles: ['OWNER'],
        email: 'veerababu.musamalla@zemosolabs.com',
        nickname: 'Veera',
        avatarUrl: '',
        timeZone: 'UTC+8 Asia/Shanghai',
        updateNickname: mockUpdateNickname,
        updateTimezone: mockUpdateTimezone,
        updateAvatar: mockUpdateAvatar,
        updateProfile: vi.fn(),
        updatePassword: mockUpdatePassword,
        logout: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();
        mockedUseAuth.mockReturnValue(defaultAuthValues as any);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders profile title, email, and read-only email warning correctly', () => {
        render(<ProfileSettingPage />);

        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('veerababu.musamalla@zemosolabs.com')).toBeInTheDocument();
        expect(screen.getByText('Once registered, E-mail cannot be changed.')).toBeInTheDocument();
        expect(screen.getByText('Veera')).toBeInTheDocument();
        expect(screen.getByText('UTC+8 Asia/Shanghai')).toBeInTheDocument();
    });

    it('opens and closes Name modal correctly', async () => {
        render(<ProfileSettingPage />);

        const editButtons = screen.getAllByRole('button', { name: /Edit/i });
        fireEvent.click(editButtons[0]);

        expect(screen.getByRole('heading', { name: /Edit Name/i })).toBeInTheDocument();

        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(screen.queryByRole('heading', { name: /Edit Name/i })).not.toBeInTheDocument();
        });
    });

    it('opens and closes Timezone modal correctly', async () => {
        render(<ProfileSettingPage />);

        const editButtons = screen.getAllByRole('button', { name: /Edit/i });
        fireEvent.click(editButtons[1]);

        expect(screen.getByRole('heading', { name: /Edit Time Zone/i })).toBeInTheDocument();

        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(screen.queryByRole('heading', { name: /Edit Time Zone/i })).not.toBeInTheDocument();
        });
    });

    it('opens and closes Password modal correctly', async () => {
        render(<ProfileSettingPage />);

        const editButtons = screen.getAllByRole('button', { name: /Edit/i });
        fireEvent.click(editButtons[2]);

        expect(screen.getByRole('heading', { name: /Edit Password/i })).toBeInTheDocument();

        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(screen.queryByRole('heading', { name: /Edit Password/i })).not.toBeInTheDocument();
        });
    });

    it('triggers file input click when avatar upload box is clicked', () => {
        render(<ProfileSettingPage />);

        const uploadBox = screen.getByText('Upload');
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const clickSpy = vi.spyOn(fileInput, 'click');

        fireEvent.click(uploadBox);

        expect(clickSpy).toHaveBeenCalled();
    });

    it('delegates avatar upload to updateAvatar hook when a valid image file is selected and crop confirmed', async () => {
        mockUpdateAvatar.mockResolvedValueOnce(true);

        render(<ProfileSettingPage />);

        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(['avatar-binary'], 'avatar.png', { type: 'image/png' });

        fireEvent.change(fileInput, { target: { files: [file] } });

        const confirmBtn = await screen.findByTestId('confirm-crop-btn');
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(mockUpdateAvatar).toHaveBeenCalledWith(expect.any(File));
            expect(screen.getByText('Modified')).toBeInTheDocument();
        });
    });

    it('handles avatar upload when no file is selected (early return branch)', () => {
        render(<ProfileSettingPage />);

        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

        fireEvent.change(fileInput, { target: { files: [] } });

        expect(mockUpdateAvatar).not.toHaveBeenCalled();
    });

    it('catches and logs exception during avatar upload failure gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        mockUpdateAvatar.mockRejectedValueOnce(new Error('Network Upload Failure'));

        render(<ProfileSettingPage />);

        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(['binary'], 'avatar.png', { type: 'image/png' });

        fireEvent.change(fileInput, { target: { files: [file] } });

        const confirmBtn = await screen.findByTestId('confirm-crop-btn');
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Failed to update cropped avatar:', expect.any(Error));
        });

        consoleSpy.mockRestore();
    });

    it('deletes avatar successfully when top-right close icon button is clicked', async () => {
        mockedUseAuth.mockReturnValue({
            ...defaultAuthValues,
            avatarUrl: 'https://example.com/avatar.png',
        } as any);
        mockUpdateAvatar.mockResolvedValueOnce(true);

        render(<ProfileSettingPage />);

        const deleteButton = screen.getByTestId('CloseIcon').parentElement!;
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockUpdateAvatar).toHaveBeenCalledWith('');
            expect(screen.getByText('Modified')).toBeInTheDocument();
        });
    });

    it('logs error when deleting avatar fails', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        mockedUseAuth.mockReturnValue({
            ...defaultAuthValues,
            avatarUrl: 'https://example.com/avatar.png',
        } as any);
        mockUpdateAvatar.mockRejectedValueOnce(new Error('Delete Error'));

        render(<ProfileSettingPage />);

        const deleteButton = screen.getByTestId('CloseIcon').parentElement!;
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Failed to delete avatar:', expect.any(Error));
        });

        consoleSpy.mockRestore();
    });
});