import { Resource } from '../types';

const API_BASE_URL = 'https://aiapikit.com/backend/api';

interface ApiError {
    message: string;
    code?: string | number;
    details?: any;
}

class ApiRequestError extends Error {
    code?: string | number;
    details?: any;

    constructor(message: string, code?: string | number, details?: any) {
        super(message);
        this.name = 'ApiRequestError';
        this.code = code;
        this.details = details;
    }
}

async function handleResponse(response: Response) {
    const contentType = response.headers.get('content-type');
    console.log('Response content type:', contentType);
    
    const isJson = contentType && contentType.includes('application/json');
    
    if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails = undefined;
        
        if (isJson) {
            try {
                const errorData = await response.json();
                console.error('Error response data:', errorData);
                errorMessage = errorData.error || errorMessage;
                errorDetails = errorData;
            } catch (e) {
                console.error('Error parsing error response:', e);
            }
        } else {
            // Try to get text response for non-JSON errors
            try {
                const textResponse = await response.text();
                console.error('Non-JSON error response:', textResponse);
                errorDetails = { rawResponse: textResponse };
            } catch (e) {
                console.error('Error getting error response text:', e);
            }
        }
        
        throw new ApiRequestError(errorMessage, response.status, errorDetails);
    }
    
    if (isJson) {
        try {
            const jsonData = await response.json();
            console.log('Parsed JSON response:', jsonData);
            return jsonData;
        } catch (e) {
            console.error('Error parsing JSON response:', e);
            // Try to get the raw response text for debugging
            try {
                const textResponse = await response.text();
                console.error('Invalid JSON response text:', textResponse);
            } catch (textError) {
                console.error('Error getting response text:', textError);
            }
            throw new ApiRequestError('Invalid JSON response from server', 'INVALID_JSON');
        }
    }
    
    throw new ApiRequestError('Invalid content type from server', 'INVALID_CONTENT_TYPE');
}

export const fetchResources = async (category?: string): Promise<Resource[]> => {
    try {
        console.log('Fetching resources...', category ? `category: ${category}` : 'all categories');
        
        const url = category 
            ? `${API_BASE_URL}/resources.php?category=${encodeURIComponent(category)}`
            : `${API_BASE_URL}/resources.php`;
            
        console.log('Request URL:', url);
        
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json'
            },
            mode: 'cors'
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const data = await handleResponse(response);
        
        // Validate the response data structure
        if (!Array.isArray(data)) {
            console.error('Invalid response structure. Expected array, got:', typeof data);
            throw new Error('Invalid response format from server');
        }
        
        // Validate each resource object
        const validatedData = data.map(item => {
            if (!item.id || !item.name || !item.category) {
                console.error('Invalid resource object:', item);
                throw new Error('Invalid resource data from server');
            }
            return item as Resource;
        });
        
        console.log('Resources fetched successfully:', validatedData);
        return validatedData;
        
    } catch (error) {
        console.error('Error fetching resources:', error);
        
        if (error instanceof ApiRequestError) {
            throw new Error(`Failed to load resources: ${error.message}${error.code ? ` (Code: ${error.code})` : ''}`);
        }
        
        throw new Error('Failed to load resources. Please check your connection and try again.');
    }
};

export const createResource = async (resource: Omit<Resource, 'id'>): Promise<Resource> => {
    try {
        console.log('Creating resource:', resource);
        
        const response = await fetch(`${API_BASE_URL}/resources.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            body: JSON.stringify(resource),
        });
        
        const data = await handleResponse(response);
        console.log('Resource created successfully:', data);
        
        return data;
    } catch (error) {
        console.error('Error creating resource:', error);
        
        if (error instanceof ApiRequestError) {
            throw new Error(`Failed to create resource: ${error.message}${error.code ? ` (Code: ${error.code})` : ''}`);
        }
        
        throw new Error('Failed to create resource. Please try again.');
    }
};

export const updateResource = async (id: string, resource: Partial<Resource>): Promise<Resource> => {
    try {
        console.log('Updating resource:', id, resource);
        
        const response = await fetch(`${API_BASE_URL}/resources.php?id=${encodeURIComponent(id)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            body: JSON.stringify(resource),
        });
        
        const data = await handleResponse(response);
        console.log('Resource updated successfully:', data);
        
        return data;
    } catch (error) {
        console.error('Error updating resource:', error);
        
        if (error instanceof ApiRequestError) {
            throw new Error(`Failed to update resource: ${error.message}${error.code ? ` (Code: ${error.code})` : ''}`);
        }
        
        throw new Error('Failed to update resource. Please try again.');
    }
};

export const deleteResource = async (id: string): Promise<void> => {
    try {
        console.log('Deleting resource:', id);
        
        const response = await fetch(`${API_BASE_URL}/resources.php?id=${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json'
            },
            mode: 'cors'
        });
        
        await handleResponse(response);
        console.log('Resource deleted successfully');
    } catch (error) {
        console.error('Error deleting resource:', error);
        
        if (error instanceof ApiRequestError) {
            throw new Error(`Failed to delete resource: ${error.message}${error.code ? ` (Code: ${error.code})` : ''}`);
        }
        
        throw new Error('Failed to delete resource. Please try again.');
    }
};
