interface Task {
  url: string;
  gid?: string;
  repo?: number;
  selections?: string;
  dir?: string;
  out?: string;
  header?: string[];
  proxy?: boolean;
  decompress?: boolean;
}

interface DownloadingInfo {
  name: string;
  completedLength: string;
  connections: string;
  downloadSpeed: string;
  numSeeders: string;
  status: string;
  totalLength: string;
}

export {
  Task,
  DownloadingInfo
};