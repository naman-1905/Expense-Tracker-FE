export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return Response.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API}/api/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return Response.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Profile API error:', error);
    return Response.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
