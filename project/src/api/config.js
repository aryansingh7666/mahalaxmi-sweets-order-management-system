const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api"

export const apiRequest = async (
  endpoint,
  options = {}
) => {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token')

  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Bypass-Tunnel-Reminder': 'true',
      ...(token && {
        'Authorization': `Bearer ${token}`
      }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(
      `${API_BASE}${endpoint}`,
      config
    )

    // Check if response is empty (e.g. 204 No Content)
    const contentType = response.headers.get("content-type");
    let data = null;
    if (contentType && contentType.indexOf("application/json") !== -1) {
      data = await response.json();
    }

    if (!response.ok) {
      console.error('API Error:', data)
      throw new Error(
        data?.message ||
        data?.detail ||
        (data ? JSON.stringify(data) : null) ||
        'Request failed'
      )
    }

    return data

  } catch (error) {
    console.error(
      'Request failed:',
      endpoint,
      error
    )
    throw error
  }
}

export default apiRequest
