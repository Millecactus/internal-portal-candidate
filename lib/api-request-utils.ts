export async function fetchAPI(endpoint: string, options: RequestInit = {}): Promise<Response> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;

    // Récupérer le token depuis sessionStorage ou cookies
    const accessToken = sessionStorage.getItem('accessToken') || document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1] || null;

    // Ne pas définir de Content-Type par défaut si on envoie un FormData
    const headers = options.body instanceof FormData
      ? {
        ...options.headers,
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      }
      : {
        ...options.headers,
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      };

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // 🔥 Envoie automatiquement les cookies HTTP-Only
    });

    if (!response.ok) {
      if (response.status === 401) {
        const currentPath = encodeURIComponent(window.location.pathname);
        window.location.href = `/login?redirectUrl=${currentPath}`;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    }

    return response;
  } catch (error) {
    console.error('Error in fetchAPI:', error);
    throw error;
  }
}

export async function fetchAPICandidate(endpoint: string, options: RequestInit = {}): Promise<Response> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;

    // Récupérer le token candidat depuis sessionStorage ou cookies
    const candidateToken = sessionStorage.getItem('candidateToken') || document.cookie.split('; ').find(row => row.startsWith('candidateToken='))?.split('=')[1] || null;

    // Ne pas définir de Content-Type par défaut si on envoie un FormData
    const headers = options.body instanceof FormData
      ? {
        ...options.headers,
        ...(candidateToken && { 'Authorization': `Bearer ${candidateToken}` }),
      }
      : {
        ...options.headers,
        'Content-Type': 'application/json',
        ...(candidateToken && { 'Authorization': `Bearer ${candidateToken}` }),
      };

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // 🔥 Envoie automatiquement les cookies HTTP-Only
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Redirection vers la page de login candidat si le token est invalide
        window.location.href = `/login`;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    }

    return response;
  } catch (error) {
    console.error('Error in fetchAPICandidate:', error);
    throw error;
  }
}

export async function fetchWithoutAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;

    // Ne pas définir de Content-Type par défaut si on envoie un FormData
    const headers = options.body instanceof FormData
      ? options.headers
      : {
        ...options.headers,
        'Content-Type': 'application/json',
      };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('Error in fetchWithoutAuth:', error);
    throw error;
  }
}

export async function checkUserAuthentication(accessToken: string | null): Promise<boolean> {
  if (!accessToken) {
    return false;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/check-auth`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.result === "ok";
  } catch (error) {
    console.error('Error checking user authentication:', error);
    return false;
  }
}

export async function checkUserAdmin(accessToken: string | null): Promise<boolean> {
  console.log("Checking user admin");
  if (!accessToken) {
    console.log("No access token found");
    return false;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.log("Response not ok");
      return false;
    }

    const isAdmin = false;
    const hasAdminPermission = false;
    return isAdmin && hasAdminPermission;
  } catch (error) {
    console.error('Error checking user admin:', error);
    return false;
  }
}