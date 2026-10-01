import { Book } from '../data/books';
import defaultGitHubConfig from '../data/github_default_config.json';

export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  filePath: string;
  token: string;
  autoSync: boolean;
  lastSyncedAt?: string;
  lastCommitSha?: string;
  lastCommitUrl?: string;
}

const STORAGE_KEY = 'bookstore_github_config';

export class GitHubSyncService {
  private config: GitHubConfig;
  private isSyncing: boolean = false;

  constructor() {
    this.config = this.loadConfig();
  }

  // Auto-detect GitHub repository from current window URL
  public detectRepoFromUrl(): { owner: string; repo: string } | null {
    if (typeof window === 'undefined') return null;
    const hostname = window.location.hostname;
    // Example: fang47007.github.io/my-bookstore/
    if (hostname.endsWith('.github.io')) {
      const owner = hostname.replace('.github.io', '');
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      const repo = pathSegments[0] || '';
      if (owner && repo) {
        return { owner, repo };
      }
    }
    return null;
  }

  public loadConfig(): GitHubConfig {
    const defaults: GitHubConfig = {
      owner: defaultGitHubConfig.owner || '',
      repo: defaultGitHubConfig.repo || '',
      branch: defaultGitHubConfig.branch || 'main',
      filePath: defaultGitHubConfig.filePath || 'src/data/server_books.json',
      token: '',
      autoSync: true,
    };

    if (typeof window === 'undefined') return defaults;

    try {
      // 1. Try reading saved config
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : {};
      
      // 2. Try auto-detecting owner & repo if missing
      const detected = this.detectRepoFromUrl();
      const owner = parsed.owner || detected?.owner || defaults.owner;
      const repo = parsed.repo || detected?.repo || defaults.repo;

      return {
        ...defaults,
        ...parsed,
        owner,
        repo,
      };
    } catch {
      return defaults;
    }
  }

  public saveConfig(config: Partial<GitHubConfig>): GitHubConfig {
    this.config = {
      ...this.config,
      ...config,
    };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
      } catch (e) {
        console.warn('Failed to save GitHub config to localStorage:', e);
      }
    }
    return this.config;
  }

  public getConfig(): GitHubConfig {
    return { ...this.config };
  }

  public isConfigured(): boolean {
    return Boolean(this.config.owner && this.config.repo && this.config.token);
  }

  // Convert string to base64 with full UTF-8 support (Thai characters, quotes, etc.)
  private utf8ToBase64(str: string): string {
    const utf8Bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    return btoa(binary);
  }

  // Convert base64 from GitHub back to UTF-8 string
  private base64ToUtf8(base64: string): string {
    const cleanBase64 = base64.replace(/\s/g, '');
    const binary = atob(cleanBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }

  // Test connection to GitHub API
  public async testConnection(): Promise<{ success: boolean; message: string; repoInfo?: any }> {
    const { owner, repo, branch, token } = this.config;
    if (!owner || !repo) {
      return { success: false, message: 'กรุณากรอก GitHub Owner และ Repository Name' };
    }
    if (!token) {
      return { success: false, message: 'กรุณากรอก Personal Access Token (PAT)' };
    }

    try {
      const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        return {
          success: false,
          message: `เชื่อมต่อไม่สำเร็จ (${resp.status}): ${errorData.message || resp.statusText}`,
        };
      }

      const repoInfo = await resp.json();
      return {
        success: true,
        message: `เชื่อมต่อสำเร็จกับ Repository "${repoInfo.full_name}" (Default Branch: ${repoInfo.default_branch})`,
        repoInfo,
      };
    } catch (err: any) {
      return { success: false, message: `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${err.message}` };
    }
  }

  // Get current file SHA from GitHub repository
  private async getFileSha(path: string): Promise<string | null> {
    const { owner, repo, branch, token } = this.config;
    try {
      const headers: Record<string, string> = {
        Accept: 'application/vnd.github.v3+json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const resp = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}&_t=${Date.now()}`,
        { headers, cache: 'no-cache' }
      );

      if (resp.ok) {
        const data = await resp.json();
        return data.sha || null;
      }
    } catch (e) {
      console.warn(`Could not get SHA for ${path}:`, e);
    }
    return null;
  }

  // Commit and Push books data directly to GitHub
  public async commitBooksToGitHub(
    books: Book[],
    actionDescription: string = 'อัปเดตรายการหนังสือ'
  ): Promise<{ success: boolean; message: string; commitUrl?: string; sha?: string }> {
    if (this.isSyncing) {
      return { success: false, message: 'กำลังซิงก์ข้อมูลกับ GitHub อยู่แล้ว' };
    }

    const { owner, repo, branch, filePath, token } = this.config;

    if (!owner || !repo) {
      return {
        success: false,
        message: 'ยังไม่ได้ตั้งค่า GitHub Owner หรือ Repository Name',
      };
    }

    if (!token) {
      return {
        success: false,
        message: 'ยังไม่ได้ระบุ GitHub Token (กรุณากรอก Personal Access Token ในหน้าแอดมิน)',
      };
    }

    this.isSyncing = true;
    try {
      const jsonString = JSON.stringify(books, null, 2);
      const base64Content = this.utf8ToBase64(jsonString);

      // 1. Get current SHA of the file
      const currentSha = await this.getFileSha(filePath);

      const commitMessage = `[Bookstore Auto-Sync] ${actionDescription} (รวม ${books.length} เล่ม) [skip ci]`;

      const requestBody: any = {
        message: commitMessage,
        content: base64Content,
        branch: branch || 'main',
      };

      if (currentSha) {
        requestBody.sha = currentSha;
      }

      // 2. Commit to primary file (e.g. src/data/server_books.json)
      const resp = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/vnd.github.v3+json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(
          `GitHub API Error (${resp.status}): ${errorData.message || resp.statusText}`
        );
      }

      const result = await resp.json();
      const commitUrl = result.commit?.html_url || `https://github.com/${owner}/${repo}/commits/${branch}`;
      const newSha = result.content?.sha;

      // 3. Also attempt to mirror commit to public/books.json so static GitHub Pages serves it immediately
      if (filePath !== 'public/books.json') {
        try {
          const publicSha = await this.getFileSha('public/books.json');
          const publicBody: any = {
            message: `[Bookstore Mirror] ${actionDescription} -> public/books.json [skip ci]`,
            content: base64Content,
            branch: branch || 'main',
          };
          if (publicSha) publicBody.sha = publicSha;

          await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/public/books.json`,
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                Accept: 'application/vnd.github.v3+json',
              },
              body: JSON.stringify(publicBody),
            }
          );
        } catch (mirrorErr) {
          console.warn('Mirror commit to public/books.json skipped/failed:', mirrorErr);
        }
      }

      // Update local configuration record
      this.saveConfig({
        lastSyncedAt: new Date().toLocaleString('th-TH'),
        lastCommitSha: newSha,
        lastCommitUrl: commitUrl,
      });

      console.log(`[GitHubSync] Successfully pushed books to GitHub: ${commitUrl}`);

      return {
        success: true,
        message: `ส่งข้อมูลและคอมมิตขึ้น GitHub เรียบร้อยแล้ว (${books.length} เล่ม)`,
        commitUrl,
        sha: newSha,
      };
    } catch (err: any) {
      console.error('[GitHubSync] Commit failed:', err);
      return {
        success: false,
        message: `ไม่สามารถส่งข้อมูลไป GitHub: ${err.message}`,
      };
    } finally {
      this.isSyncing = false;
    }
  }

  // Fetch the latest books directly from GitHub (Public or Private)
  // This allows ANY visitor (even not logged in) to see the exact latest changes!
  public async fetchBooksFromGitHub(): Promise<{ success: boolean; books: Book[]; source: string } | null> {
    const { owner, repo, branch, filePath, token } = this.config;

    // Method 1: Check GitHub Raw CDN (Fast, public, zero rate-limit for visitors)
    if (owner && repo) {
      try {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch || 'main'}/${filePath}?t=${Date.now()}`;
        const resp = await fetch(rawUrl, { cache: 'no-cache' });
        if (resp.ok) {
          const books = await resp.json();
          if (Array.isArray(books) && books.length > 0) {
            return { success: true, books, source: 'github_raw' };
          }
        }
      } catch (rawErr) {
        console.warn('GitHub Raw fetch attempt failed:', rawErr);
      }
    }

    // Method 2: Check relative ./books.json (On GitHub Pages or local web server)
    try {
      const localResp = await fetch(`./books.json?t=${Date.now()}`, { cache: 'no-cache' });
      if (localResp.ok) {
        const books = await localResp.json();
        if (Array.isArray(books) && books.length > 0) {
          return { success: true, books, source: 'static_books_json' };
        }
      }
    } catch {}

    // Method 3: If token exists, use GitHub API directly
    if (owner && repo && token) {
      try {
        const resp = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch || 'main'}&_t=${Date.now()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github.v3+json',
            },
            cache: 'no-cache',
          }
        );
        if (resp.ok) {
          const data = await resp.json();
          if (data.content) {
            const jsonText = this.base64ToUtf8(data.content);
            const books = JSON.parse(jsonText);
            if (Array.isArray(books)) {
              return { success: true, books, source: 'github_api' };
            }
          }
        }
      } catch (apiErr) {
        console.warn('GitHub API fetch attempt failed:', apiErr);
      }
    }

    return null;
  }
}

export const githubSyncService = new GitHubSyncService();
