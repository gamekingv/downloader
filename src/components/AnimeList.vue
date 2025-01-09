<template>
  <v-row class="my-2">
    <v-col cols="5">
      <v-btn
        block
        large
        depressed
        :disabled="loading"
        @click.stop="loadList('sources')"
      >
        源列表
      </v-btn>
    </v-col>
    <v-col cols="5">
      <v-btn
        block
        large
        depressed
        :disabled="loading"
        @click.stop="loadList('downloaded')"
      >
        下载列表
      </v-btn>
    </v-col>
    <v-col cols="1">
      <v-btn block large depressed @click.stop="refreshList(editing)">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-col>
    <v-col cols="1">
      <v-btn block large depressed @click.stop="expandTo(5)">
        <v-icon>mdi-numeric-5-box-multiple-outline</v-icon>
      </v-btn>
    </v-col>

    <v-col cols="12" class="jse-theme-dark">
      <JsonEditorVue v-model="list" ref="editor" />
    </v-col>
    <v-col cols="12">
      <v-btn
        :disabled="sending"
        :loading="sending"
        block
        large
        depressed
        @click.stop="save()"
      >
        保存
      </v-btn>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Vue, Component, Emit, Ref } from 'vue-property-decorator';
import network from '@/utils/network';
import VCA from '@vue/composition-api';
import JsonEditorVue from 'json-editor-vue';

Vue.use(VCA);

@Component({
  components: {
    JsonEditorVue,
  },
})
export default class AnimeList extends Vue {
  @Emit()
  private alert(text: string, type?: string, error?: unknown): void {
    text;
    type;
    error;
  }

  @Ref('editor') private readonly editor: typeof JsonEditorVue;

  private sending = false;
  private list: any[] = [];
  private sourceList = '';
  private sourceListSha = '';
  private downloadedList = '';
  private downloadedListSha = '';
  private editing: 'sources' | 'downloaded' = 'sources';
  private loading = false;
  private listInfo = { sources: '', downloaded: '', repo: '' };

  private async mounted() {
    await this.refreshList();
  }

  private async refreshList(type: 'sources' | 'downloaded' = 'sources') {
    this.loading = true;
    try {
      const listInfo = JSON.parse(await network.giteeFetch('list.json'));
      if (listInfo) {
        this.listInfo = listInfo;
        let { content, sha } = await network.giteeFetchWithSha(
          listInfo.sources,
          listInfo.repo
        );
        this.sourceList = content;
        this.sourceListSha = sha;
        ({ content, sha } = await network.giteeFetchWithSha(
          listInfo.downloaded,
          listInfo.repo
        ));
        this.downloadedList = content;
        this.downloadedListSha = sha;
      } else throw new Error('获取列表信息失败');
      this.loadList(type);
    } catch (e) {
      this.alert('获取列表失败', 'error', e);
    }
    this.loading = false;
  }

  private loadList(type: 'sources' | 'downloaded') {
    if (type === 'sources') {
      this.list = JSON.parse(this.sourceList);
      this.editing = 'sources';
    } else {
      this.list = JSON.parse(this.downloadedList);
      this.editing = 'downloaded';
    }
    setTimeout(() => {
      // this.$nextTick(() => {
      this.expandTo(5);
      // });
    }, 300);
  }

  private expandTo(deep: number) {
    this.editor.jsonEditor.collapse([], () => true);
    this.editor.jsonEditor.expand(
      [],
      (relativePath: any) => relativePath.length < deep
    );
  }

  private async save() {
    this.sending = true;
    try {
      const { sha } = await network.giteePut(
        this.listInfo[this.editing],
        this.listInfo.repo,
        JSON.stringify(this.list, null, 2),
        this.editing === 'sources' ? this.sourceListSha : this.downloadedListSha
      );
      if (this.editing === 'sources') this.sourceListSha = sha;
      else this.downloadedListSha = sha;
      this.alert('保存成功', 'success');
    } catch (error) {
      this.alert(`${error}`, 'error', error);
    }
    this.sending = false;
  }
}
</script>
