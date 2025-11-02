import { NextRequest, NextResponse } from 'next/server';
import { fetchGitHubGraphQL } from '@/lib/github/client';
import { GRAPHQL_REPOS_QUERY } from '@/lib/github/queries';
import type {
  GitHubRepository,
  GitHubGraphQLReposResponse,
} from '@/lib/github/types';
import { siteConfig } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const token = process.env.GITHUB_TOKEN;
    const searchParams = request.nextUrl.searchParams;
    const featured =
      searchParams.get('featured')?.split(',').filter(Boolean) || [];
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!token) {
      return NextResponse.json(
        { error: 'GitHub token not configured' },
        { status: 500 }
      );
    }

    // Fetch all repositories
    let allRepos: Array<{
      id: string;
      name: string;
      nameWithOwner: string;
      description?: string | null;
      url: string;
      homepageUrl?: string | null;
      stargazers?: {
        totalCount?: number;
      };
      forkCount?: number;
      isPrivate: boolean;
      isArchived: boolean;
      isTemplate: boolean;
      primaryLanguage?: {
        name: string;
        color: string;
      } | null;
      updatedAt: string;
      createdAt: string;
      pushedAt: string;
      languages?: {
        totalSize: number;
        edges: Array<{
          size: number;
          node: {
            name: string;
            color: string;
          };
        }>;
      };
      defaultBranchRef?: {
        target?: {
          history?: {
            totalCount?: number;
          };
        };
      } | null;
    }> = [];
    let hasNextPage = true;
    let endCursor: string | null = null;

    while (hasNextPage && allRepos.length < 100) {
      const variables: { login: string; after: string | null } = {
        login: siteConfig.personal.githubUsername,
        after: endCursor,
      };

      const data = await fetchGitHubGraphQL<GitHubGraphQLReposResponse>(
        GRAPHQL_REPOS_QUERY,
        variables,
        token
      );
      const repos = data.user?.repositories?.nodes || [];

      allRepos = [...allRepos, ...repos];

      hasNextPage = data.user?.repositories?.pageInfo?.hasNextPage || false;
      endCursor = data.user?.repositories?.pageInfo?.endCursor || null;
    }

    // Filter out private, archived, and template repositories
    let publicRepos = allRepos.filter(
      repo => !repo.isPrivate && !repo.isArchived && !repo.isTemplate
    );

    // If featured repos are specified, prioritize them
    if (featured.length > 0) {
      const featuredRepos = publicRepos.filter(repo =>
        featured.some(name =>
          repo.name.toLowerCase().includes(name.toLowerCase())
        )
      );
      const otherRepos = publicRepos.filter(
        repo =>
          !featured.some(name =>
            repo.name.toLowerCase().includes(name.toLowerCase())
          )
      );
      publicRepos = [...featuredRepos, ...otherRepos];
    }

    // Sort by stars and take top N
    publicRepos.sort(
      (a, b) =>
        (b.stargazers?.totalCount || 0) - (a.stargazers?.totalCount || 0)
    );
    publicRepos = publicRepos.slice(0, limit);

    const repositories: GitHubRepository[] = publicRepos.map(repo => {
      const totalCount = repo.defaultBranchRef?.target?.history?.totalCount;
      return {
        id: repo.id,
        name: repo.name,
        nameWithOwner: repo.nameWithOwner,
        description: repo.description ?? null,
        url: repo.url,
        homepageUrl: repo.homepageUrl ?? null,
        stargazerCount: repo.stargazers?.totalCount || 0,
        forkCount: repo.forkCount || 0,
        isPrivate: repo.isPrivate,
        isArchived: repo.isArchived,
        isTemplate: repo.isTemplate,
        primaryLanguage: repo.primaryLanguage
          ? {
              name: repo.primaryLanguage.name,
              color: repo.primaryLanguage.color,
            }
          : null,
        updatedAt: repo.updatedAt,
        createdAt: repo.createdAt,
        pushedAt: repo.pushedAt,
        languages: repo.languages || { totalSize: 0, edges: [] },
        defaultBranchRef:
          typeof totalCount === 'number'
            ? {
                target: {
                  history: {
                    totalCount,
                  },
                },
              }
            : null,
      };
    });

    return NextResponse.json(repositories, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    // Log error in production for monitoring, but don't expose details to client
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching GitHub repositories:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch GitHub repositories' },
      { status: 500 }
    );
  }
}
