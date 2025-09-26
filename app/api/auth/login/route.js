export async function POST(request) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return Response.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Login API error:', error);
    return Response.json(
      { error: 'Failed to process login request' },
      { status: 500 }
    );
  }
}