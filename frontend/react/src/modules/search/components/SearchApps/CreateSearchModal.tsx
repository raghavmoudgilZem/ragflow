import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import React from 'react'
import { useCreateSearchConfig } from '../../hooks/useCreateSearch';
import type { CreateSearchPayload } from '../../types/search.types';
import { useNavigate } from 'react-router-dom';

interface CreateSearchModalProps {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateSearchModal: React.FC<CreateSearchModalProps> = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();
    const handleClose = () => {
        setIsOpen(false);
    };

    const { mutate, isPending } = useCreateSearchConfig();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const nameValue = formData.get('name');
        // Validation guard clause required by TypeScript
        if (typeof nameValue !== 'string' || !nameValue.trim()) {
            return;
        }

        const payload: CreateSearchPayload = {
            name: nameValue,
        };
        mutate(payload, {
            onSuccess: (data) => {
                handleClose(); // Close the modal layout cleanly
                
                // Assuming your response object returns the created item id (e.g., data.id)
                // Navigate seamlessly to the search execution screen passing the unique id
                navigate(`/searches/${data.id}`); 
            },
            onError: (error) => {
                console.error('Failed to create search app config:', error.message);
                // The shared apiClient interceptor will trigger a notification popup automatically
            }
        });
        handleClose();
    };
    return (
        <div className='create-search-modal-wrapper'>
            <Dialog open={isOpen} onClose={handleClose} maxWidth={"xs"} fullWidth>
                <DialogTitle>Create Search</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit} id="subscription-form">
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            id="name"
                            name="name"
                            label="Please input name"
                            type="text"
                            fullWidth
                            variant="standard"
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button
                        type="submit"
                        form="subscription-form"
                        disabled={isPending}
                    >
                        {isPending ? <CircularProgress size={20} /> : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default CreateSearchModal