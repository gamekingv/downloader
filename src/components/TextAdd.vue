<template>
  <v-form v-model="validate" @submit.prevent>
    <v-row class="my-2" no-gutters>
      <v-col cols="12">
        <v-textarea
          v-model="aria2"
          :rules="[(v) => !!v || '*必要']"
          outlined
          dense
        >
          <template v-slot:label>
            Aria2下载文本<span class="red--text">*</span>
          </template>
        </v-textarea>
      </v-col>
      <v-col cols="12">
        <v-select
          v-model.number="repo"
          :items="repos"
          label="仓库"
          outlined
          dense
        ></v-select>
      </v-col>
      <v-col cols="12">
        <v-checkbox
          v-model="proxy"
          label="使用代理下载"
          hide-details
        ></v-checkbox>
      </v-col>
      <v-col cols="12">
        <v-checkbox
          v-model="decompress"
          label="自动解压压缩包"
          hide-details
        ></v-checkbox>
      </v-col>
      <v-col cols="12">
        <v-checkbox v-model="exCookie" label="使用 EX Cookie"></v-checkbox>
      </v-col>
      <v-btn
        :disabled="!validate || sending"
        :loading="sending"
        block
        large
        depressed
        @click.stop="sendToDownload"
      >
        发送下载
      </v-btn>
    </v-row>
  </v-form>
</template>

<script lang="ts">
import { Vue, Component, Emit, Prop } from 'vue-property-decorator';
import { Task } from '@/utils/types';
import network from '@/utils/network';

@Component


export default class TextAdd extends Vue {
  @Emit()
  private alert(text: string, type?: string, error?: unknown): void { text; type; error; }

  @Prop(Array) private readonly repos!: { text: string; value: number }[]

  private validate = false
  private repo: number | '' = ''
  private aria2 = ''
  private proxy = false
  private decompress = false
  private exCookie = false
  private sending = false

  private parseText() {
    const lines = this.aria2.split('\n');
    const tasks: Task[] = [];
    for (const line of lines) {
      if (line[0] !== ' ') tasks.push({ url: line });
      else {
        const [, name, value] = line.trim().match(/([^=]*)=(.*)/) || [];
        const task = tasks[tasks.length - 1];
        switch (name) {
          case 'selections':
          case 'dir':
          case 'out': {
            task[name] = value;
            break;
          }
          case 'header': {
            if (task.header) task.header.push(value);
            else task.header = [value];
            break;
          }
        }
      }
    }
    return tasks;
  }
  private async sendToDownload() {
    this.sending = true;
    try {
      const tasks = this.parseText();
      let cookie = '';
      if (this.exCookie) {
        cookie = await network.giteeFetch('ex_cookie.txt');
      }
      tasks.forEach(task => {
        if (typeof this.repo === 'number') task.repo = this.repo;
        if (this.proxy) task.proxy = this.proxy;
        if (this.decompress) task.decompress = this.decompress;
        if (this.exCookie) {
          if (task.header) task.header.push(cookie.trim());
          else task.header = [cookie.trim()];
          this.alert('获取 EX Cookie 信息成功', 'success');
        }
      });
      await network.sendToDownload(tasks);
      this.alert('发送成功', 'success');
    }
    catch (error) { this.alert(`${error}`, 'error', error); }
    this.sending = false;
  }
}
</script>
