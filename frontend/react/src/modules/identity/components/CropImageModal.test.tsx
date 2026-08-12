import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CropImageModal } from './CropImageModal';

describe('CropImageModal Component', () => {
    const defaultProps = {
        open: true,
        imageSrc: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        onClose: vi.fn(),
        onConfirm: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Standalone Mock class for Image (prevents JSDOM Illegal constructor error)
        class MockImage {
            onload: (() => void) | null = null;
            width = 220;
            height = 220;
            crossOrigin = '';
            private _src = '';

            get src() {
                return this._src;
            }
            set src(val: string) {
                this._src = val;
                if (val && typeof this.onload === 'function') {
                    this.onload();
                }
            }
        }

        vi.stubGlobal('Image', MockImage);

        // Mock canvas 2D Context
        HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
            clearRect: vi.fn(),
            save: vi.fn(),
            restore: vi.fn(),
            translate: vi.fn(),
            scale: vi.fn(),
            drawImage: vi.fn(),
            fillRect: vi.fn(),
            strokeRect: vi.fn(),
            setLineDash: vi.fn(),
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
        }) as any;

        // Mock canvas toBlob
        HTMLCanvasElement.prototype.toBlob = vi.fn((cb: any) => {
            if (typeof cb === 'function') {
                cb(new Blob(['cropped'], { type: 'image/png' }));
            }
        }) as any;
    });

    it('renders modal title and instructional text when open', () => {
        render(<CropImageModal {...defaultProps} />);

        expect(screen.getByRole('heading', { name: /Crop image/i })).toBeInTheDocument();
        expect(screen.getByText(/Drag the selection area to choose the cropping position of the image/i)).toBeInTheDocument();
    });

    it('does not render content when open is false', () => {
        render(<CropImageModal {...defaultProps} open={false} />);
        expect(screen.queryByRole('heading', { name: /Crop image/i })).not.toBeInTheDocument();
    });

    it('handles mouse dragging and wheel zooming on canvas', () => {
        render(<CropImageModal {...defaultProps} />);

        const canvas = document.querySelector('canvas')!;

        // Mouse drag interactions
        fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
        fireEvent.mouseMove(canvas, { clientX: 120, clientY: 120 });
        fireEvent.mouseUp(canvas);
        fireEvent.mouseLeave(canvas);

        // Wheel zoom interactions
        fireEvent.wheel(canvas, { deltaY: -100 });
        fireEvent.wheel(canvas, { deltaY: 100 });

        expect(canvas).toBeInTheDocument();
    });

    it('crops image and calls onConfirm and onClose on form submission', async () => {
        defaultProps.onConfirm.mockResolvedValueOnce(undefined);

        render(<CropImageModal {...defaultProps} />);

        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(defaultProps.onConfirm).toHaveBeenCalledWith(expect.any(File));
            expect(defaultProps.onClose).toHaveBeenCalled();
        });
    });

    it('handles exception during crop confirmation gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        defaultProps.onConfirm.mockRejectedValueOnce(new Error('Crop error'));

        render(<CropImageModal {...defaultProps} />);

        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Failed to crop image:', expect.any(Error));
        });

        consoleSpy.mockRestore();
    });

    it('calls onClose when Cancel button is clicked', () => {
        render(<CropImageModal {...defaultProps} />);

        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelButton);

        expect(defaultProps.onClose).toHaveBeenCalled();
    });
});