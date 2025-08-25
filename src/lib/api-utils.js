// API Response wrapper
export function apiResponse(data = null, error = null, message = '') {
  return {
    success: !error,
    data,
    error: error?.message || error,
    message
  }
}

// API Error handler
export function handleApiError(error) {if (error.code === 'P2002') {
    return apiResponse(null, 'A record with this information already exists')
  }
  
  if (error.code === 'P2025') {
    return apiResponse(null, 'Record not found')
  }
  
  return apiResponse(null, error.message || 'An unexpected error occurred')
}

// Validate required fields
export function validateRequiredFields(data, requiredFields) {
  const missing = requiredFields.filter(field => !data[field])
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }
}
