// GitHub API Client

const GITHUB_API_URL = 'https://api.github.com/graphql';

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    type: string;
  }>;
}

interface GraphQLVariables {
  [key: string]: string | number | boolean | null | undefined;
}

async function retryRequest(
  requestFn: () => Promise<Response>,
  maxRetries = 3,
  delay = 1000
): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await requestFn();
      if (response.ok) {
        return response;
      }
      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `GitHub API rate limit exceeded: ${JSON.stringify(errorData)}`
        );
      }
      if (response.status >= 500 && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`
      );
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}

export async function fetchGitHubGraphQL<T>(
  query: string,
  variables: GraphQLVariables = {},
  token?: string
): Promise<T> {
  if (!token) {
    throw new Error('GitHub token is required');
  }

  const response = await retryRequest(() =>
    fetch(GITHUB_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    })
  );

  const data: GraphQLResponse<T> = await response.json();

  if (data.errors && data.errors.length > 0) {
    throw new Error(
      `GraphQL errors: ${data.errors.map(e => e.message).join(', ')}`
    );
  }

  if (!data.data) {
    throw new Error('No data returned from GitHub API');
  }

  return data.data;
}
