import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { BaseModal } from './BaseModal';
import { PALETTE } from '../../../shared/theme/theme';

interface CropImageModalProps {
    open: boolean;
    imageSrc: string | null;
    onClose: () => void;
    onConfirm: (croppedFile: File) => Promise<void>;
}

export const CropImageModal: React.FC<CropImageModalProps> = ({
    open,
    imageSrc,
    onClose,
    onConfirm
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
    const [baseScale, setBaseScale] = useState(1);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!imageSrc) {
            setImageObj(null);
            return;
        }
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            setImageObj(img);
            const fitScale = Math.min(220 / (img.width || 220), 220 / (img.height || 220));
            setBaseScale(fitScale || 1);
            setZoom(1);
            setOffset({ x: 0, y: 0 });
        };
        img.src = imageSrc;
    }, [imageSrc]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !imageObj) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        ctx.save();
        ctx.translate(width / 2 + offset.x, height / 2 + offset.y);
        
        const effectiveScale = baseScale * zoom;
        ctx.scale(effectiveScale, effectiveScale);

        ctx.drawImage(imageObj, -imageObj.width / 2, -imageObj.height / 2);
        ctx.restore();

        const cropWidth = 160;
        const cropHeight = 160;
        const cropX = (width - cropWidth) / 2;
        const cropY = (height - cropHeight) / 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(0, 0, width, cropY);
        ctx.fillRect(0, cropY + cropHeight, width, height - (cropY + cropHeight));
        ctx.fillRect(0, cropY, cropX, cropHeight);
        ctx.fillRect(cropX + cropWidth, cropY, width - (cropX + cropWidth), cropHeight);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(cropX, cropY, cropWidth, cropHeight);
    }, [imageObj, baseScale, zoom, offset]);

    useEffect(() => {
        if (open && imageObj) {
            draw();
        }
    }, [open, imageObj, draw]);

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging) return;
        setOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
        setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.5), 3));
    };

    const handleConfirmCrop = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageObj) return;

        setIsSubmitting(true);
        try {
            const cropCanvas = document.createElement('canvas');
            const outputSize = 256;
            cropCanvas.width = outputSize;
            cropCanvas.height = outputSize;

            const ctx = cropCanvas.getContext('2d');
            if (ctx && canvasRef.current) {
                const viewportCanvas = canvasRef.current;
                const cropSize = 160;
                const srcX = (viewportCanvas.width - cropSize) / 2;
                const srcY = (viewportCanvas.height - cropSize) / 2;

                ctx.drawImage(
                    viewportCanvas,
                    srcX, srcY, cropSize, cropSize,
                    0, 0, outputSize, outputSize
                );
            }

            cropCanvas.toBlob(async (blob) => {
                if (blob) {
                    try {
                        const file = new File([blob], 'cropped-avatar.png', { type: 'image/png' });
                        await onConfirm(file);
                        onClose();
                    } catch (error) {
                        console.error('Failed to crop image:', error);
                    }
                }
                setIsSubmitting(false);
            }, 'image/png');
        } catch (error) {
            console.error('Failed to crop image:', error);
            setIsSubmitting(false);
        }
    };

    return (
        <BaseModal
            open={open}
            onClose={onClose}
            title="Crop image"
            onSubmit={handleConfirmCrop}
            submitLabel="Confirm"
            cancelLabel="Cancel"
            isSubmitting={isSubmitting}
            maxWidth="xs"
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                <Box
                    sx={{
                        width: '100%',
                        height: '260px',
                        backgroundColor: '#121214',
                        borderRadius: '0.375rem',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: isDragging ? 'grabbing' : 'grab',
                        userSelect: 'none'
                    }}
                >
                    <canvas
                        ref={canvasRef}
                        width={320}
                        height={260}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onWheel={handleWheel}
                        style={{ width: '320px', height: '260px', touchAction: 'none' }}
                    />
                </Box>

                <Typography
                    sx={{
                        fontSize: '0.8rem',
                        color: PALETTE.text.secondary,
                        textAlign: 'center',
                        px: '0.5rem'
                    }}
                >
                    Drag the selection area to choose the cropping position of the image, and scroll to zoom in/out
                </Typography>
            </Box>
        </BaseModal>
    );
};