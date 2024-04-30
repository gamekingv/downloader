import ky from 'ky';
import { Task, DownloadingInfo } from '@/utils/types';

export default {
  requestSender(): typeof ky {
    const server = localStorage.getItem('server') || '';
    const token = localStorage.getItem('serverToken') || '';
    return ky.extend({
      prefixUrl: server,
      headers: {
        'Authorization': `token ${token}`
      }
    });
  },
  async sendToDownload(tasks: Task | Task[]): Promise<void> {
    await this.requestSender().post('task', {
      json: tasks,
      searchParams: {
        action: 'add'
      }
    });
  },
  async sendToRemove(gid: string): Promise<void> {
    await this.requestSender().post('task', {
      json: { gid },
      searchParams: {
        action: 'remove'
      }
    });
  },
  async sendToClear(gid: string): Promise<void> {
    await this.requestSender().post('task', {
      json: { gid },
      searchParams: {
        action: 'clear'
      }
    });
  },
  async giteeFetch(file: string): Promise<string> {
    const repo = localStorage.getItem('repository') || '';
    const token = localStorage.getItem('repositoryToken') || '';
    const { content } = await ky.get(`repos/${repo}/contents/${file}`, {
      prefixUrl: 'https://gitee.com/api/v5',
      searchParams: {
        access_token: token
      }
    }).json();
    return this.decodeToUTF8(content);
  },
  decodeToUTF8(base64: string): string {
    const text = atob(base64);
    const length = text.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = text.charCodeAt(i);
    }
    const decoder = new TextDecoder(); // default is utf-8
    return decoder.decode(bytes);
  },
  async getDownloadingList(): Promise<DownloadingInfo[] | undefined> {
    const { result } = await this.requestSender().get('downloading').json();
    return result;
  }
};