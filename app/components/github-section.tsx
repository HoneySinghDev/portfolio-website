'use client';

import { useEffect, useRef, useState, useMemo, memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import GitHubContributionGraph from './github-contribution-graph';
import SectionWrapper from '@/components/section-wrapper';
import SectionTitle from '@/components/section-title';
import SectionDescription from '@/components/section-description';
import type {
  GitHubStats,
  GitHubRepository,
  GitHubActivity,
} from '@/lib/github/types';
import { siteConfig } from '@/lib/config';

// Featured repositories from config - extract IDs for API calls
const FEATURED_REPOS = siteConfig.github.featuredRepos.map(repo => repo.id);

interface RepositoryDisplay extends GitHubRepository {
  icon?: React.ReactNode;
  tags?: string[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function getLanguageColor(language: string | null): string {
  const colors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Python: '#3572A5',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    Go: '#00ADD8',
    Rust: '#dea584',
    PHP: '#4F5D95',
    Ruby: '#701516',
    Swift: '#fa7343',
    Kotlin: '#A97BFF',
    HTML: '#e34c26',
    CSS: '#563d7c',
    SCSS: '#c6538c',
    Shell: '#89e051',
    Dockerfile: '#384d54',
    Vue: '#4fc08d',
    React: '#61dafb',
  };
  return colors[language || ''] || '#8e8e93';
}

function getLanguageIcon(): React.ReactNode {
  // Simple icon based on language - you can enhance this
  return <Icon icon='lucide:codepen' className='h-4 w-4' />;
}

interface GithubSectionProps {
  registerSection?: (id: string, el: HTMLElement | null) => void;
}

function GithubSection({ registerSection }: GithubSectionProps = {}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeRepo, setActiveRepo] = useState<string | null>(null);
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [repositories, setRepositories] = useState<RepositoryDisplay[]>([]);
  const [activity, setActivity] = useState<GitHubActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Register section with navigation
  useEffect(() => {
    if (registerSection && sectionRef.current) {
      registerSection('github', sectionRef.current);
    }
  }, [registerSection]);

  useEffect(() => {
    let isMounted = true;
    let scrollTimeout: NodeJS.Timeout | null = null;

    // Check if section is already visible (e.g., when navigating directly)
    const checkVisibility = () => {
      if (!isMounted || !sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
      if (isInViewport) {
        setIsVisible(true);
      }
    };

    // Check immediately and after a short delay (for navigation)
    checkVisibility();
    const timeoutId = setTimeout(() => {
      checkVisibility();
    }, 100);

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry && entry.isIntersecting && isMounted) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    // Also check on scroll (for navigation completion) - throttled
    const handleScroll = () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        checkVisibility();
        scrollTimeout = null;
      }, 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    async function fetchGitHubData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch stats, repos, and activity in parallel
        const [statsRes, reposRes, activityRes] = await Promise.allSettled([
          fetch('/api/github/stats'),
          fetch(
            `/api/github/repos?limit=6${FEATURED_REPOS.length > 0 ? `&featured=${FEATURED_REPOS.join(',')}` : ''}`
          ),
          fetch('/api/github/activity'),
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
          const statsData = await statsRes.value.json();
          setStats(statsData);
        } else {
          // Silently handle stats fetch failure - component will show default state
        }

        if (reposRes.status === 'fulfilled' && reposRes.value.ok) {
          const reposData = await reposRes.value.json();
          const formattedRepos: RepositoryDisplay[] = reposData.map(
            (repo: GitHubRepository) => ({
              ...repo,
              icon: getLanguageIcon(),
              tags:
                repo.languages?.edges?.slice(0, 3).map(e => e.node.name) || [],
            })
          );
          setRepositories(formattedRepos);
        } else {
          // Silently handle repos fetch failure - component will show default state
        }

        if (activityRes.status === 'fulfilled' && activityRes.value.ok) {
          const activityData = await activityRes.value.json();
          setActivity(activityData);
        } else {
          // Silently handle activity fetch failure - component will show default state
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load GitHub data'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchGitHubData();
  }, []);

  const gitHubStats = useMemo(
    () =>
      stats
        ? [
            {
              label: 'Repositories',
              value: stats.totalRepos,
              icon: <Icon icon='lucide:book-open' className='h-5 w-5' />,
            },
            {
              label: 'Stars',
              value: stats.totalStars,
              icon: <Icon icon='lucide:star' className='h-5 w-5' />,
            },
            {
              label: 'Contributed To',
              value: stats.contributedTo,
              icon: <Icon icon='lucide:users' className='h-5 w-5' />,
            },
            {
              label: 'Contributions',
              value:
                stats.totalCommits > 1000
                  ? `${(stats.totalCommits / 1000).toFixed(1)}k+`
                  : `${stats.totalCommits}+`,
              icon: <Icon icon='lucide:code' className='h-5 w-5' />,
            },
          ]
        : [],
    [stats]
  );

  const activityItems = useMemo(
    () =>
      activity
        ? [
            {
              icon: <Icon icon='lucide:git-commit' className='h-4 w-4' />,
              text: `${activity.commits} commits in the last year`,
            },
            {
              icon: <Icon icon='lucide:git-pull-request' className='h-4 w-4' />,
              text: `${activity.pullRequests} pull requests opened`,
            },
            {
              icon: <Icon icon='lucide:git-branch' className='h-4 w-4' />,
              text: `${activity.repositoriesContributedTo} repositories contributed to`,
            },
            {
              icon: <Icon icon='lucide:hash' className='h-4 w-4' />,
              text: `${activity.issues} issues opened`,
            },
          ]
        : [],
    [activity]
  );

  return (
    <SectionWrapper ref={sectionRef} id='github' className='min-h-screen'>
      <SectionTitle title='GitHub Activity' />
      <SectionDescription description='Check out my open-source contributions and coding activity on GitHub' />

      {error && (
        <div className='text-center text-red-400 mb-4 px-4'>
          <p className='text-sm sm:text-base'>⚠️ {error}</p>
          <p className='text-xs sm:text-sm text-muted-foreground mt-2'>
            Make sure GITHUB_TOKEN is set in your environment variables
          </p>
        </div>
      )}

      <div className='w-full max-w-full overflow-x-hidden'>
        <motion.div
          className='transition-all duration-700 ease-out w-full'
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <Card className='h-full bg-black/50 backdrop-blur-sm border-2 border-honey-800/50 w-full max-w-full overflow-x-hidden'>
            <CardContent className='p-4 sm:p-6 w-full max-w-full overflow-x-hidden'>
              <div className='flex items-center mb-4 sm:mb-6'>
                <Link
                  href={siteConfig.contact.socialLinks.github}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='group relative flex-shrink-0'
                  aria-label={`Visit ${siteConfig.github.username} GitHub profile`}
                >
                  {stats?.avatarUrl ? (
                    <Image
                      src={stats.avatarUrl}
                      alt={`${siteConfig.github.username} GitHub Profile`}
                      width={60}
                      height={60}
                      className='rounded-full relative z-10 transition-transform duration-300 group-hover:scale-105 w-12 h-12 sm:w-14 sm:h-14'
                    />
                  ) : (
                    <div
                      className='h-12 w-12 sm:h-14 sm:w-14 bg-honey-900/20 rounded-full flex items-center justify-center'
                      aria-hidden='true'
                    >
                      <Icon
                        icon='lucide:github'
                        className='h-6 w-6 text-honey-400'
                      />
                    </div>
                  )}
                </Link>
                <div className='ml-3 sm:ml-4 min-w-0 flex-1'>
                  <Link
                    href={siteConfig.contact.socialLinks.github}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-lg sm:text-xl font-bold text-honey-400 hover:underline flex items-center break-words'
                    aria-label={`Visit ${stats?.login || siteConfig.github.username} GitHub profile`}
                  >
                    <span className='truncate'>
                      {stats?.login || siteConfig.github.username}
                    </span>
                    <Icon
                      icon='lucide:external-link'
                      className='h-3 w-3 sm:h-4 sm:w-4 ml-1 opacity-70 flex-shrink-0'
                      aria-hidden='true'
                    />
                  </Link>
                </div>
              </div>

              {loading ? (
                <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8'>
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className='text-center p-2 sm:p-3 bg-honey-900/20 rounded-lg border border-honey-800/50 animate-pulse'
                    >
                      <div className='h-4 w-4 sm:h-5 sm:w-5 bg-honey-500/20 rounded mx-auto mb-2'></div>
                      <div className='h-5 sm:h-6 w-10 sm:w-12 bg-honey-500/20 rounded mx-auto mb-1'></div>
                      <div className='h-3 sm:h-4 w-12 sm:w-16 bg-honey-500/20 rounded mx-auto'></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8'>
                  {gitHubStats.map((stat, index) => (
                    <motion.div
                      key={index}
                      className='text-center p-2 sm:p-3 bg-honey-900/20 rounded-lg border border-honey-800/50 hover:border-honey-500/50 transition-all duration-300 has-tooltip'
                      initial={{ opacity: 0, y: 20 }}
                      animate={isVisible ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{
                        y: -5,
                        boxShadow: '0 0 15px rgba(255, 255, 0, 0.3)',
                      }}
                    >
                      <div className='flex justify-center mb-2 text-honey-500'>
                        {stat.icon}
                      </div>
                      <div className='font-bold text-base sm:text-lg'>
                        {stat.value}
                      </div>
                      <div className='text-[10px] sm:text-xs text-muted-foreground'>
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <h3 className='font-semibold mb-3 sm:mb-4 neon-text-blue text-sm sm:text-base'>
                Contribution Graph
              </h3>
              <div className='relative w-full max-w-full overflow-x-hidden -mx-2 sm:-mx-4 px-2 sm:px-4'>
                <GitHubContributionGraph />
              </div>

              <div className='mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-honey-800/30'>
                <h3 className='font-semibold mb-3 neon-text-green text-sm sm:text-base'>
                  Contribution Activity
                </h3>
                {loading ? (
                  <div className='space-y-2 sm:space-y-3'>
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className='flex items-center text-xs sm:text-sm animate-pulse'
                      >
                        <div className='w-5 h-5 sm:w-6 sm:h-6 bg-honey-500/20 rounded-full mr-2 sm:mr-3 flex-shrink-0'></div>
                        <div className='h-3 sm:h-4 w-32 sm:w-48 bg-honey-500/20 rounded'></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='space-y-2 sm:space-y-3'>
                    {activityItems.map((item, index) => (
                      <motion.div
                        key={index}
                        className='flex items-center text-xs sm:text-sm text-muted-foreground'
                        initial={{ opacity: 0, x: -20 }}
                        animate={isVisible ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                      >
                        <span className='inline-flex items-center justify-center rounded-full bg-honey-900/30 p-1 mr-2 sm:mr-3 flex-shrink-0'>
                          <span className='text-honey-400'>{item.icon}</span>
                        </span>
                        <span className='break-words'>{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Popular Repositories */}
      <div className='mt-8 sm:mt-16 w-full max-w-full overflow-x-hidden'>
        <h2 className='text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 neon-text-pink px-4'>
          Popular Repositories
        </h2>
        {loading ? (
          <div className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4'>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className='p-3 sm:p-4 border border-honey-800/50 rounded-lg bg-black/40 animate-pulse'
              >
                <div className='h-5 sm:h-6 w-24 sm:w-32 bg-honey-500/20 rounded mb-2'></div>
                <div className='h-3 sm:h-4 w-full bg-honey-500/20 rounded mb-3 sm:mb-4'></div>
                <div className='flex gap-2'>
                  <div className='h-4 sm:h-5 w-12 sm:w-16 bg-honey-500/20 rounded'></div>
                  <div className='h-4 sm:h-5 w-12 sm:w-16 bg-honey-500/20 rounded'></div>
                </div>
              </div>
            ))}
          </div>
        ) : repositories.length > 0 ? (
          <div className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4'>
            {repositories.map((repo, index) => {
              const languageColor = getLanguageColor(
                repo.primaryLanguage?.name || null
              );
              const commitCount =
                repo.defaultBranchRef?.target?.history?.totalCount || 0;

              return (
                <motion.div
                  key={repo.id}
                  className={cn(
                    'p-3 sm:p-4 border border-honey-800/50 rounded-lg transition-all duration-300 repo-card bg-black/40 w-full max-w-full',
                    activeRepo === repo.id
                      ? 'bg-honey-900/30 border-honey-500/50'
                      : ''
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                  onMouseEnter={() => setActiveRepo(repo.id)}
                  onMouseLeave={() => setActiveRepo(null)}
                >
                  <div className='flex justify-between items-start mb-2'>
                    <div className='flex items-start flex-1 min-w-0'>
                      <div
                        className='p-1 rounded mr-2 flex-shrink-0'
                        style={{ backgroundColor: `${languageColor}20` }}
                      >
                        <span style={{ color: languageColor }}>
                          {repo.icon}
                        </span>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <Link
                          href={repo.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='font-semibold flex items-center hover:text-honey-400 transition-colors text-sm sm:text-base break-words'
                          aria-label={`View ${repo.name} repository on GitHub`}
                        >
                          <span className='truncate'>{repo.name}</span>
                          <Icon
                            icon='lucide:external-link'
                            className='h-3 w-3 ml-1 opacity-70 flex-shrink-0'
                            aria-hidden='true'
                          />
                        </Link>
                        {repo.primaryLanguage && (
                          <span
                            className='ml-1 sm:ml-2 text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded inline-block mt-1'
                            style={{
                              backgroundColor: `${languageColor}20`,
                              color: languageColor,
                            }}
                          >
                            {repo.primaryLanguage.name}
                          </span>
                        )}
                        <p className='text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-2 break-words'>
                          {repo.description || 'No description'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {activeRepo === repo.id && (
                    <motion.div
                      className='mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-honey-800/30 text-[10px] sm:text-xs'
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className='grid grid-cols-3 gap-1 sm:gap-2 mb-2'>
                        <div className='flex flex-col items-center p-1 bg-honey-900/20 rounded'>
                          <Icon
                            icon='lucide:git-commit'
                            className='h-2.5 w-2.5 sm:h-3 sm:w-3 mb-0.5 sm:mb-1 text-honey-400'
                          />
                          <span className='text-center break-words'>
                            {commitCount} commits
                          </span>
                        </div>
                        <div className='flex flex-col items-center p-1 bg-honey-900/20 rounded'>
                          <Icon
                            icon='lucide:star'
                            className='h-2.5 w-2.5 sm:h-3 sm:w-3 mb-0.5 sm:mb-1 text-honey-400'
                          />
                          <span className='text-center break-words'>
                            {repo.stargazerCount} stars
                          </span>
                        </div>
                        <div className='flex flex-col items-center p-1 bg-honey-900/20 rounded'>
                          <Icon
                            icon='lucide:git-branch'
                            className='h-2.5 w-2.5 sm:h-3 sm:w-3 mb-0.5 sm:mb-1 text-honey-400'
                          />
                          <span className='text-center break-words'>
                            {repo.forkCount} forks
                          </span>
                        </div>
                      </div>
                      <div className='flex justify-between text-muted-foreground text-[10px] sm:text-xs'>
                        <span className='break-words'>
                          Updated {formatDate(repo.updatedAt)}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  <div className='flex flex-wrap gap-1 mt-2'>
                    {repo.tags?.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className='px-1.5 sm:px-2 py-0.5 bg-honey-900/30 text-[10px] sm:text-xs rounded text-honey-300 break-words'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className='text-center text-muted-foreground px-4'>
            <p className='text-sm sm:text-base'>No repositories found</p>
          </div>
        )}

        <motion.div
          className='text-center mt-8 sm:mt-12 px-4'
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <p className='text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base'>
            Want to collaborate on a project? Check out my repositories and
            let's work together!
          </p>
          <Link
            href={`${siteConfig.contact.socialLinks.github}?tab=repositories`}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center text-honey-400 hover:text-honey-300 transition-colors text-sm sm:text-base'
            aria-label='View all repositories on GitHub'
          >
            <span>View all repositories</span>
            <Icon
              icon='lucide:external-link'
              className='h-3 w-3 sm:h-4 sm:w-4 ml-1'
              aria-hidden='true'
            />
          </Link>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}

export default memo(GithubSection);
