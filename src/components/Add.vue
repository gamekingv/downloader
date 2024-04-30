<template>
  <v-form v-model="validate" @submit.prevent>
    <v-row class="my-2" no-gutters>
      <v-col cols="12">
        <v-text-field
          v-model="url"
          :rules="[(v) => !!v || '*必要']"
          outlined
          dense
        >
          <template v-slot:label>
            下载链接<span class="red--text">*</span>
          </template>
        </v-text-field>
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
        <v-text-field
          v-model="selections"
          label="文件选择"
          outlined
          dense
          placeholder="BT 专用，留空为全选文件，逗号分割，可用 - 表示连续文件序号"
        ></v-text-field>
      </v-col>
      <v-col cols="12">
        <v-text-field
          v-model="dir"
          label="下载路径"
          outlined
          dense
        ></v-text-field>
      </v-col>
      <v-col cols="12">
        <v-text-field
          v-model="out"
          label="指定文件名"
          outlined
          dense
        ></v-text-field>
      </v-col>
      <v-col cols="12">
        <v-textarea
          v-model="headers"
          label="请求头"
          outlined
          dense
          hide-details
          placeholder="每行一项，“请求头名: 请求头值”"
        ></v-textarea>
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


export default class Add extends Vue {
  @Emit()
  private alert(text: string, type?: string, error?: unknown): void { text; type; error; }

  @Prop(Array) private readonly repos!: { text: string; value: number }[]

  private validate = false
  private repo: number | '' = ''
  private url = ''
  private selections = ''
  private dir = ''
  private out = ''
  private headers = ''
  private proxy = false
  private decompress = false
  private exCookie = false
  private sending = false

  private async sendToDownload() {
    this.sending = true;
    try {
      const task: Task = { url: this.url };
      if (typeof this.repo === 'number') task.repo = this.repo;
      if (this.selections) task.selections = this.selections;
      if (this.dir) task.dir = this.dir;
      if (this.out) task.out = this.out;
      if (this.proxy) task.proxy = this.proxy;
      if (this.decompress) task.decompress = this.decompress;
      if (this.headers) task.header = this.headers.split('\n').map(e => e.trim());
      if (this.exCookie) {
        const cookie = await network.giteeFetch('ex_cookie.txt');
        if (task.header) task.header.push(cookie.trim());
        else task.header = [cookie.trim()];
        this.alert('获取 EX Cookie 信息成功', 'success');
      }
      await network.sendToDownload(task);
      this.alert('发送成功', 'success');
    }
    catch (error) { this.alert(`${error}`, 'error', error); }
    this.sending = false;
  }
}
</script>
