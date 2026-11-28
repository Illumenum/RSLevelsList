import { store } from '../main.js';
import { embed } from '../util.js';
import { score } from '../score.js';
import { fetchPacks } from '../content.js';
import Spinner from '../components/Spinner.js';

export default {
    components: { Spinner },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <table class="list" v-if="packs">
                    <tr v-for="(pack, i) in packs">
                        <td class="rank">
                            <p class="type-label-lg">#{{ i + 1 }}</p>
                        </td>
                        <td class="level" :class="{ 'active': selectedPack == i }">
                            <button @click="selectPack(i)">
                                <span class="type-label-lg" :style="{ color: pack.colour }">{{ pack.name }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container">
                <div class="level" v-if="pack">
                    <h1 :style="{ color: pack.colour }">{{ pack.name }}</h1>
                    <div class="tabs" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
                        <button
                            v-for="([lvl, err, rank], idx) in pack.levels"
                            @click="selectedLevel = idx"
                            class="btn"
                            :style="{ opacity: selectedLevel === idx ? 1 : 0.6 }"
                        >
                            {{ lvl ? '#' + rank + ' ' + lvl.name : 'Error: ' + err }}
                        </button>
                    </div>
                    <template v-if="currentLevel">
                        <h2>#{{ currentRank }} – {{ currentLevel.name }}</h2>
                        <div class="level-authors">
                            <div class="type-title-sm">Publisher</div>
                            <p class="type-body">{{ currentLevel.author }}</p>
                            <div class="type-title-sm">Creators</div>
                            <p class="type-body">{{ currentLevel.creators.join(', ') }}</p>
                            <div class="type-title-sm">Verifier</div>
                            <p class="type-body">{{ currentLevel.verifier }}</p>
                        </div>
                        <iframe class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                        <ul class="stats">
                            <li>
                                <div class="type-label-lg">Points when completed</div>
                                <p>{{ score(currentRank, 100, currentLevel.percentToQualify) }}</p>
                            </li>
                            <li>
                                <div class="type-label-lg">ID</div>
                                <p>{{ currentLevel.id }}</p>
                            </li>
                            <li>
                                <div class="type-label-lg">Password</div>
                                <p>{{ currentLevel.password || 'Free to Copy' }}</p>
                            </li>
                        </ul>
                        <h2>Records</h2>
                        <p v-if="currentRank <= 75"><strong>{{ currentLevel.percentToQualify }}%</strong> or better to qualify</p>
                        <p v-else-if="currentRank <= 150"><strong>100%</strong> or better to qualify</p>
                        <p v-else>This level does not accept new records.</p>
                        <table class="records">
                            <tr v-for="record in currentLevel.records" class="record">
                                <td class="percent">
                                    <p>{{ record.percent }}%</p>
                                </td>
                                <td class="user">
                                    <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                                </td>
                                <td class="mobile">
                                    <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                                </td>
                                <td class="hz">
                                    <p>{{ record.hz }}Hz</p>
                                </td>
                            </tr>
                        </table>
                    </template>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <h3>About Packs</h3>
                    <p>
                        Packs are curated groups of levels on the list. Beat all levels in a pack to complete it!
                    </p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        packs: [],
        errors: [],
        selectedPack: 0,
        selectedLevel: 0,
        loading: true,
        store,
    }),
    computed: {
        pack() {
            return this.packs ? this.packs[this.selectedPack] : null;
        },
        currentLevelEntry() {
            return this.pack ? this.pack.levels[this.selectedLevel] : null;
        },
        currentLevel() {
            return this.currentLevelEntry ? this.currentLevelEntry[0] : null;
        },
        currentRank() {
            return this.currentLevelEntry ? this.currentLevelEntry[2] : null;
        },
        video() {
            if (!this.currentLevel) return '';
            return embed(this.currentLevel.verification);
        },
    },
    async mounted() {
        this.packs = await fetchPacks();
        if (!this.packs) {
            this.errors = ['Failed to load packs. Check data/_packlist.json for typos.'];
        } else {
            this.packs.forEach((pack) => {
                pack.levels.forEach(([lvl, err]) => {
                    if (err) {
                        this.errors.push(`Pack "${pack.name}": Failed to load level "${err}".`);
                    }
                });
            });
        }
        this.loading = false;
    },
    methods: {
        embed,
        score,
        selectPack(i) {
            this.selectedPack = i;
            this.selectedLevel = 0;
        },
    },
};

