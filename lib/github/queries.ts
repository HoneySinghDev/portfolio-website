// GraphQL queries for GitHub API

export const GRAPHQL_REPOS_FIELD = `
  repositories(first: 100, ownerAffiliations: OWNER, orderBy: {direction: DESC, field: STARGAZERS}, after: $after) {
    totalCount
    nodes {
      id
      name
      nameWithOwner
      description
      url
      homepageUrl
      stargazers {
        totalCount
      }
      forkCount
      isPrivate
      isArchived
      isTemplate
      primaryLanguage {
        name
        color
      }
      updatedAt
      createdAt
      pushedAt
      languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
        totalSize
        edges {
          size
          node {
            name
            color
          }
        }
      }
      defaultBranchRef {
        target {
          ... on Commit {
            history {
              totalCount
            }
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
`;

export const GRAPHQL_STATS_QUERY = `
  query userInfo($login: String!, $after: String, $includeMergedPullRequests: Boolean!, $startTime: DateTime) {
    user(login: $login) {
      name
      login
      avatarUrl
      bio
      followers {
        totalCount
      }
      following {
        totalCount
      }
      commits: contributionsCollection(from: $startTime) {
        totalCommitContributions
      }
      reviews: contributionsCollection {
        totalPullRequestReviewContributions
      }
      repositoriesContributedTo(first: 1, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) {
        totalCount
      }
      pullRequests(first: 1) {
        totalCount
      }
      mergedPullRequests: pullRequests(states: MERGED) @include(if: $includeMergedPullRequests) {
        totalCount
      }
      openIssues: issues(states: OPEN) {
        totalCount
      }
      closedIssues: issues(states: CLOSED) {
        totalCount
      }
      repositories(first: 100, ownerAffiliations: OWNER, orderBy: {direction: DESC, field: STARGAZERS}, after: $after) {
        totalCount
        nodes {
          id
          name
          nameWithOwner
          description
          url
          homepageUrl
          stargazers {
            totalCount
          }
          forkCount
          isPrivate
          isArchived
          isTemplate
          primaryLanguage {
            name
            color
          }
          updatedAt
          createdAt
          pushedAt
          languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
            totalSize
            edges {
              size
              node {
                name
                color
              }
            }
          }
          defaultBranchRef {
            target {
              ... on Commit {
                history {
                  totalCount
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const GRAPHQL_CONTRIBUTIONS_QUERY = `
  query contributions($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalIssueContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        totalRepositoryContributions
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              color
            }
          }
        }
      }
    }
  }
`;

export const GRAPHQL_REPOS_QUERY = `
  query userRepos($login: String!, $after: String) {
    user(login: $login) {
      repositories(first: 100, ownerAffiliations: OWNER, orderBy: {direction: DESC, field: STARGAZERS}, after: $after) {
        totalCount
        nodes {
          id
          name
          nameWithOwner
          description
          url
          homepageUrl
          stargazers {
            totalCount
          }
          forkCount
          isPrivate
          isArchived
          isTemplate
          primaryLanguage {
            name
            color
          }
          updatedAt
          createdAt
          pushedAt
          languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
            totalSize
            edges {
              size
              node {
                name
                color
              }
            }
          }
          defaultBranchRef {
            target {
              ... on Commit {
                history {
                  totalCount
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;
