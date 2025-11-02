import { NextResponse } from 'next/server';
import { fetchGitHubGraphQL } from '@/lib/github/client';
import { GRAPHQL_STATS_QUERY } from '@/lib/github/queries';
import type { GitHubStats, GitHubGraphQLUserStats } from '@/lib/github/types';
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

    const data = await fetchGitHubGraphQL<{ user: GitHubGraphQLUserStats }>(
      GRAPHQL_STATS_QUERY,
      variables,
      token
    );

    const user = data.user;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate total stars from repositories
    const totalStars = user.repositories.nodes.reduce(
      (sum: number, repo) => sum + (repo.stargazers?.totalCount || 0),
      0
    );

    const stats: GitHubStats = {
      name: user.name || user.login,
      login: user.login,
      avatarUrl: user.avatarUrl,
      totalRepos: user.repositories.totalCount,
      totalStars,
      totalCommits: user.commits?.totalCommitContributions || 0,
      totalPRs: user.pullRequests?.totalCount || 0,
      totalPRsMerged: user.mergedPullRequests?.totalCount || 0,
      totalReviews: user.reviews?.totalPullRequestReviewContributions || 0,
      totalIssues:
        (user.openIssues?.totalCount || 0) +
        (user.closedIssues?.totalCount || 0),
      contributedTo: user.repositoriesContributedTo?.totalCount || 0,
      followers: user.followers?.totalCount || 0,
      following: user.following?.totalCount || 0,
    };

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    // Log error in production for monitoring, but don't expose details to client
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching GitHub stats:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch GitHub stats' },
      { status: 500 }
    );
  }
}
