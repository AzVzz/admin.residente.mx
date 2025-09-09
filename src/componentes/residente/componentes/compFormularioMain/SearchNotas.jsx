import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

export default function SearchNotas({ searchTerm, setSearchTerm }) {
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || '');

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setLocalSearchTerm(value);
        setSearchTerm(value);
    };

    const handleClearSearch = () => {
        setLocalSearchTerm('');
        setSearchTerm('');
    };

    return (
        <TextField
            placeholder="Buscar notas..."
            value={localSearchTerm}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            sx={{
                minWidth: 300,
                '& .MuiOutlinedInput-root': {
                    borderRadius: '0.75rem', // rounded-xl
                    backgroundColor: '#fff',
                    '& fieldset': {
                        borderColor: '#bdbdbd',
                    },
                    '&:hover fieldset': {
                        borderColor: '#1976d2',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                        borderWidth: 2,
                    },
                },
                '& .MuiInputBase-input': {
                    fontSize: '0.875rem', // text-sm
                    padding: '0.5rem 0.75rem', // py-2 px-3
                },
            }}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#666', fontSize: '1.25rem' }} />
                    </InputAdornment>
                ),
                endAdornment: localSearchTerm && (
                    <InputAdornment position="end">
                        <IconButton
                            onClick={handleClearSearch}
                            size="small"
                            sx={{ 
                                color: '#666',
                                '&:hover': { color: '#1976d2' }
                            }}
                        >
                            <ClearIcon fontSize="small" />
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    );
}
