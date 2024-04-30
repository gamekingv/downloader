<template>
  <v-row class="my-2" dense>
    <v-col cols="12">
      <v-row class="mx-0" justify="space-between">
        <v-subheader class="px-0"
          >服务器连接状态：<v-chip
            label
            x-small
            :color="connected === null ? '' : connected ? 'success' : 'error'"
            >{{
              connected === null ? "初始化" : connected ? "成功" : "失败"
            }}</v-chip
          ></v-subheader
        >
        <v-subheader class="px-0"
          >更新时间：<v-chip label x-small>{{
            connected === null ? "初始化" : fetchTime
          }}</v-chip></v-subheader
        >
      </v-row>
    </v-col>
    <v-col v-for="task in info" :key="task.name" cols="12">
      <v-badge
        color="transparent"
        bottom
        overlap
        bordered
        avatar
        style="width: 100%"
      >
        <template v-slot:badge>
          <v-btn
            v-if="
              task.status === 'active' ||
              task.status === 'error' ||
              task.status === 'removed'
            "
            color="grey darken-3"
            fab
            depressed
            x-small
            :width="20"
            :height="20"
            style="z-index: 1"
            @click.stop="
              task.status === 'active'
                ? removeTask(task.gid)
                : clearTask(task.gid)
            "
          >
            <v-icon x-small>{{
              task.status === "active" ? "mdi-stop" : "mdi-close"
            }}</v-icon>
          </v-btn>
        </template>
        <v-card class="px-2 pt-1 pb-2" outlined :title="task.name">
          <v-row class="ma-0">
            <div class="text-subtitle-1 text-truncate">{{ task.name }}</div>
          </v-row>
          <v-row class="ma-0" justify="space-between">
            <div class="text-caption">
              {{ task.completedLength | sizeParser }}/{{
                task.totalLength | sizeParser
              }}
              {{ task | remainTimeParser }}
            </div>
            <!-- <div class="text-caption">{{ task | remainTimeParser }}</div> -->
            <div v-if="task.status === 'active'" class="text-caption">
              ({{ task.numSeeders
              }}{{ Number.isNaN(Number(task.numSeeders)) ? "" : "/"
              }}{{ task.connections }}) {{ task.downloadSpeed | sizeParser }}/s
            </div>
            <div v-else class="text-caption">
              {{ task.status | statusParser }}
            </div>
          </v-row>
          <v-row class="ma-0">
            <v-progress-linear height="20" :value="task | progressParser">
              <div class="text-caption">{{ task | progressParser }}%</div>
            </v-progress-linear>
          </v-row>
          <!-- <v-row class="ma-0" justify="space-between">
          <div class="text-caption">
            {{ task.downloadSpeed | sizeParser }}/s
          </div>
        </v-row> -->
        </v-card>
      </v-badge>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Vue, Component, Emit } from 'vue-property-decorator';
import { DownloadingInfo } from '@/utils/types';
import network from '@/utils/network';

@Component({
  filters: {
    progressParser(task: DownloadingInfo) {
      const totalLength = Number(task.totalLength);
      const completedLength = Number(task.completedLength);
      let progress = 0;
      if (totalLength > 0 && completedLength >= 0) {
        progress = (completedLength / totalLength) * 100;
      }
      return Math.floor(progress * 100) / 100;
    },
    sizeParser(speedString: string) {
      const speed = Number(speedString) ?? 0;
      if (speed < 1024) return `${speed.toFixed(2)}B`;
      else if (speed < Math.pow(1024, 2)) return `${(speed / 1024).toFixed(2)}KB`;
      else if (speed < Math.pow(1024, 3)) return `${(speed / Math.pow(1024, 2)).toFixed(2)}MB`;
      else if (speed < Math.pow(1024, 4)) return `${(speed / Math.pow(1024, 3)).toFixed(2)}GB`;
    },
    statusParser(status: string) {
      switch (status) {
        case 'active': return '下载中';
        case 'waiting': return '等待中';
        case 'paused': return '暂停';
        case 'error': return '出错';
        case 'complete': return '下载完成';
        case 'removed': return '已删除';
      }
    },
    remainTimeParser(task: DownloadingInfo) {
      if (task.status !== 'active') return '';
      const totalLength = Number(task.totalLength);
      const completedLength = Number(task.completedLength);
      const downloadSpeed = Number(task.downloadSpeed);
      let remainTime = 0;
      if (totalLength > 0 && downloadSpeed > 0 && completedLength >= 0) {
        remainTime = Math.ceil((totalLength - completedLength) / downloadSpeed);
      }
      let s = 0, m = 0, h = 0;
      if (remainTime === 0) return '';
      else {
        if (remainTime < 60) s = remainTime;
        else if (remainTime < 60 * 60) {
          m = Math.floor(remainTime / 60);
          s = remainTime - 60 * m;
        }
        else {
          h = Math.floor(remainTime / 60 / 60);
          m = Math.floor((remainTime - h * 60 * 60) / 60);
          s = remainTime - h * 60 * 60 - m * 60;
        }
        return `(${`0${h}`.slice(-2)}:${`0${m}`.slice(-2)}:${`0${s}`.slice(-2)})`;
      }
    }
  }
})


export default class Downloading extends Vue {
  @Emit()
  private alert(text: string, type?: string, error?: unknown): void { text; type; error; }

  private info: DownloadingInfo[] = []
  private connected: boolean | null = null
  private fetchTime = ''

  private created() {
    this.updateDownloadInfo();
  }

  private async updateDownloadInfo() {
    try {
      const tasks = await network.getDownloadingList();
      this.connected = true;
      if (tasks) {
        this.info.length = 0;
        this.info.push(...tasks);
      }
    }
    catch (e) {
      this.connected = false;
    }
    this.updateFetchTime();
    await new Promise(res => setTimeout(res, 5000));
    this.updateDownloadInfo();
  }
  private updateFetchTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const hour = `0${now.getHours()}`.slice(-2);
    const minute = `0${now.getMinutes()}`.slice(-2);
    const second = `0${now.getSeconds()}`.slice(-2);
    this.fetchTime = `${year}/${month}/${date} ${hour}:${minute}:${second}`;
  }
  private async removeTask(gid: string) {
    try {
      await network.sendToRemove(gid);
      this.alert('发送删除命令成功', 'success');
    }
    catch (e) { this.alert('发送删除命令失败', 'error', e); }

  }
  private async clearTask(gid: string) {
    try {
      await network.sendToClear(gid);
      this.alert('发送清除命令成功', 'success');
    }
    catch (e) { this.alert('发送清除命令失败', 'error', e); }
  }
}
</script>
