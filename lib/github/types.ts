// GitHub API Types

export interface GitHubStats {
  name: string;
  login: string;
  avatarUrl: string;
  totalRepos: number;
  totalStars: number;
  totalCommits: number;
  totalPRs: number;
  totalPRsMerged: number;
  totalReviews: number;
  totalIssues: number;
  contributedTo: number;
  followers: number;
  following: number;
}

export interface GitHubRepository {
  id: string;
  name: string;
  nameWithOwner: string;
  description: string | null;
  url: string;
  homepageUrl: string | null;
  stargazerCount: number;
  forkCount: number;
  isPrivate: boolean;
  isArchived: boolean;
  isTemplate: boolean;
  primaryLanguage: {
    name: string;
    color: string;
  } | null;
  updatedAt: string;
  createdAt: string;
  pushedAt: string;
  languages: {
    totalSize: number;
    edges: Array<{
      size: number;
      node: {
        name: string;
        color: string;
      };
    }>;
  };
  defaultBranchRef: {
    target: {
      history: {
        totalCount: number;
      };
    };
  } | null;
}

export interface ContributionDay {
  date: string;
  contributionCount: number;
  color: string;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface GitHubContributions {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export interface GitHubActivity {
  commits: number;
  pullRequests: number;
  repositoriesContributedTo: number;
  issues: number;
  reviews: number;
}

export interface GitHubGraphQLUserActivity {
  commits?: {
    totalCommitContributions?: number;
  };
  pullRequests?: {
    totalCount?: number;
  };
  repositoriesContributedTo?: {
    totalCount?: number;
  };
  openIssues?: {
    totalCount?: number;
  };
  closedIssues?: {
    totalCount?: number;
  };
  reviews?: {
    totalPullRequestReviewContributions?: number;
  };
}

export interface GitHubGraphQLUserStats {
  name?: string;
  login: string;
  avatarUrl: string;
  repositories: {
    totalCount: number;
    nodes: Array<{
      stargazers?: {
        totalCount?: number;
      };
    }>;
  };
  commits?: {
    totalCommitContributions?: number;
  };
  pullRequests?: {
    totalCount?: number;
  };
  mergedPullRequests?: {
    totalCount?: number;
  };
  reviews?: {
    totalPullRequestReviewContributions?: number;
  };
  openIssues?: {
    totalCount?: number;
  };
  closedIssues?: {
    totalCount?: number;
  };
  repositoriesContributedTo?: {
    totalCount?: number;
  };
  followers?: {
    totalCount?: number;
  };
  following?: {
    totalCount?: number;
  };
}

export interface GitHubGraphQLContributions {
  user?: {
    contributionsCollection?: {
      contributionCalendar?: {
        totalContributions?: number;
        weeks?: ContributionWeek[];
      };
    };
  };
}

export interface GitHubGraphQLReposResponse {
  user?: {
    repositories?: {
      totalCount?: number;
      nodes?: Array<{
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
      }>;
      pageInfo?: {
        hasNextPage?: boolean;
        endCursor?: string | null;
      };
    };
  };
}
