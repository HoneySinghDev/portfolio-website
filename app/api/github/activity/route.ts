import { NextResponse } from 'next/server';
import { fetchGitHubGraphQL } from '@/lib/github/client';
import { GRAPHQL_STATS_QUERY } from '@/lib/github/queries';
import type {
  GitHubActivity,
  GitHubGraphQLUserActivity,
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

    // Calculate start time for the last year
    const startTime = new Date();
    startTime.setFullYear(startTime.getFullYear() - 1);
    startTime.setMonth(0, 1); // January 1st

    const variables = {
      login: siteConfig.personal.githubUsername,
      after: null,
      includeMergedPullRequests: true,
      startTime: startTime.toISOString(),
    };

    const data = await fetchGitHubGraphQL<{ user: GitHubGraphQLUserActivity }>(
      GRAPHQL_STATS_QUERY,
      variables,
      token
    );

    const user = data.user;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const activity: GitHubActivity = {
      commits: user.commits?.totalCommitContributions || 0,
      pullRequests: user.pullRequests?.totalCount || 0,
      repositoriesContributedTo:
        user.repositoriesContributedTo?.totalCount || 0,
      issues:
        (user.openIssues?.totalCount || 0) +
        (user.closedIssues?.totalCount || 0),
      reviews: user.reviews?.totalPullRequestReviewContributions || 0,
    };

    return NextResponse.json(activity, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    // Log error in production for monitoring, but don't expose details to client
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching GitHub activity:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch GitHub activity' },
      { status: 500 }
    );
  }
}
