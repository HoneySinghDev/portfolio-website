import { NextResponse } from 'next/server';
import { fetchGitHubGraphQL } from '@/lib/github/client';
import { GRAPHQL_CONTRIBUTIONS_QUERY } from '@/lib/github/queries';
import type {
  GitHubContributions,
  GitHubGraphQLContributions,
} from '@/lib/github/types';
import { siteConfig } from '@/lib/config';

export async function GET() {
  try {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: 'GitHub token not configured' },
        { status: 500 }
      );
    }

    // Calculate date range for the last year
    const to = new Date();
    const from = new Date();
    from.setFullYear(from.getFullYear() - 1);
    from.setDate(from.getDate() - 1); // Include today

    const variables = {
      login: siteConfig.personal.githubUsername,
      from: from.toISOString(),
      to: to.toISOString(),
    };

    const data = await fetchGitHubGraphQL<GitHubGraphQLContributions>(
      GRAPHQL_CONTRIBUTIONS_QUERY,
      variables,
      token
    );

    const contributions = data.user?.contributionsCollection;

    if (!contributions) {
      return NextResponse.json(
        { error: 'Contributions data not found' },
        { status: 404 }
      );
    }

    const result: GitHubContributions = {
      totalContributions:
        contributions.contributionCalendar?.totalContributions || 0,
      weeks: contributions.contributionCalendar?.weeks || [],
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    // Log error in production for monitoring, but don't expose details to client
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching GitHub contributions:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch GitHub contributions' },
      { status: 500 }
    );
  }
}
