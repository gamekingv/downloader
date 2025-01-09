<template>
  <v-app>
    <v-app-bar app>
      <v-tabs v-model="tab" fixed-tabs>
        <v-tab key="add" class="primary--text">
          <v-icon>mdi-plus-circle</v-icon>
        </v-tab>

        <v-tab key="text-add" class="primary--text">
          <v-icon>mdi-plus-box-multiple</v-icon>
        </v-tab>

        <v-tab key="download" class="primary--text">
          <v-icon>mdi-download</v-icon>
        </v-tab>

        <v-tab key="anime-list" class="primary--text">
          <v-icon>mdi-format-list-text</v-icon>
        </v-tab>
      </v-tabs>
    </v-app-bar>

    <v-main>
      <v-container>
        <v-row class="ma-0 mb-3" justify="center">
          <v-sheet class="pa-3 rounded-lg" width="100%" max-width="1024">
            <v-text-field
              v-model="repository"
              label="仓库地址"
              prefix="https://gitee.com/"
              outlined
              dense
              @input="saveRepository"
            ></v-text-field>
            <v-text-field
              v-model="repositoryToken"
              label="仓库Token"
              outlined
              dense
              @input="saveRepositoryToken"
            ></v-text-field>
            <v-text-field
              v-model="server"
              label="服务器地址"
              outlined
              dense
              @input="saveServer"
            ></v-text-field>
            <v-text-field
              v-model="serverToken"
              label="服务器Token"
              outlined
              dense
              hide-details
              @input="saveServerToken"
            ></v-text-field>
          </v-sheet>
        </v-row>
        <v-row class="ma-0" justify="center">
          <v-tabs-items
            v-model="tab"
            class="rounded-lg pa-3"
            style="max-width: 1024px; width: 100%"
          >
            <v-tab-item key="add">
              <Add :repos="repos" @alert="showAlert" />
            </v-tab-item>
            <v-tab-item key="text-add">
              <TextAdd :repos="repos" @alert="showAlert" />
            </v-tab-item>
            <v-tab-item key="download">
              <Downloading @alert="showAlert" />
            </v-tab-item>
            <v-tab-item key="anime-list">
              <AnimeList @alert="showAlert" />
            </v-tab-item>
          </v-tabs-items>
        </v-row>
      </v-container>
    </v-main>

    <v-snackbar
      v-for="(alert, index) in alerts"
      :key="index"
      v-model="alert.show"
      :color="alert.type"
      :timeout="5000"
      top
      right
      transition="slide-x-reverse-transition"
      :style="`margin-top: ${index * 64}px`"
    >
      {{ alert.text }}
    </v-snackbar>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Add from './components/Add.vue';
import TextAdd from './components/TextAdd.vue';
import Downloading from './components/Downloading.vue';
import AnimeList from './components/AnimeList.vue';
import network from '@/utils/network';

@Component({
  components: {
    Add,
    TextAdd,
    Downloading,
    AnimeList,
  },
})
export default class APP extends Vue {
  private tab = 'add';
  private repos: { text: string; value: number }[] = [];
  private repository = '';
  private repositoryToken = '';
  private server = '';
  private serverToken = '';
  private alerts: {
    show: boolean;
    text: string;
    type: string;
    shown: boolean;
  }[] = [];

  private async mounted() {
    this.repository = localStorage.getItem('repository') || '';
    this.repositoryToken = localStorage.getItem('repositoryToken') || '';
    this.server = localStorage.getItem('server') || '';
    this.serverToken = localStorage.getItem('serverToken') || '';
    if (this.repository && this.repositoryToken) {
      try {
        const server = await network.giteeFetch('public_url.txt');
        const serverToken = await network.giteeFetch('token.txt');
        const repos = JSON.parse(await network.giteeFetch('repo.json'));
        this.repos.push(
          ...repos.map((name: string, index: number) => ({
            text: name,
            value: index,
          }))
        );
        if (this.server !== server || this.serverToken !== serverToken) {
          this.server = server;
          this.saveServer(server);
          this.serverToken = serverToken;
          this.saveServerToken(serverToken);
          this.showAlert('从Gitee更新服务器信息成功', 'success');
        }
      } catch (e) {
        this.showAlert('从Gitee获取服务器信息失败', 'error', e);
      }
    }
  }
  private saveRepository(repository: string) {
    localStorage.setItem('repository', repository);
  }
  private saveRepositoryToken(repositoryToken: string) {
    localStorage.setItem('repositoryToken', repositoryToken);
  }
  private saveServer(server: string) {
    localStorage.setItem('server', server);
  }
  private saveServerToken(serverToken: string) {
    localStorage.setItem('serverToken', serverToken);
  }
  private showAlert(text: string, type = '', error?: unknown): void {
    const freeAlert = this.alerts.find(
      (alert) => alert.show === false && alert.shown === true
    );
    const newAlert = { show: false, text, type, shown: false };
    if (freeAlert) {
      newAlert.show = true;
      newAlert.shown = true;
      Object.assign(freeAlert, newAlert);
    } else {
      this.alerts.push(newAlert);
      this.$nextTick(() => {
        newAlert.show = true;
        newAlert.shown = true;
      });
    }
    if (type === 'error' && error instanceof Error) {
      // eslint-disable-next-line
      console.error(
        // @ts-expect-error ignore
        `%c${this.$projectName}%cv${this.$projectVersion}%c ${
          error.stack ?? error
        }`,
        'border-radius: 4px 0 0 4px;color:#fff;background:#424242; padding: 0 4px',
        'color:white;background:#01579B;border-radius: 0 4px 4px 0;padding: 0 4px',
        ''
      );
    }
  }
}
</script>
