import { store } from '../main.js';
import { embed } from '../util.js';
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
                    <ul class="stats">
                        <li>
                            <div class="type-label-lg">Pack Bonus Points</div>
                            <p>{{ pack.score || 0 }}</p>
                        </li>
                        <li>
                            <div class="type-label-lg">Levels</div>
                            <p>{{ pack.levels.length }}</p>
                        </li>
                    </ul>
                    <div class="tabs" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 1rem 0;">
                        <button
                            v-for="([lvl, err, rank], idx) in pack.levels"
                            @click="selectedLevel = idx"
                            class="btn"
                            :style="{ opacity: selectedLevel === idx ? 1 : 0.6, fontFamily: 'inherit' }"
                        >
                            <span class="type-label-lg">{{ lvl ? '#' + rank + ' ' + lvl.name : 'Error: ' + err }}</span>
                        </button>
                    </div>
                    <template v-if="currentLevel">
                        <h2>#{{ currentRank }} – {{ currentLevel.name }}</h2>
                        <div class="level-authors">
                           <template v-if="currentLevel.author">
                             <div class="type-title-sm">Publisher</div>
                             <p class="type-body">{{ currentLevel.author }}</p>
                           </template>
                           <template v-if="currentLevel.creators && currentLevel.creators.length > 0">
                             <div class="type-title-sm">Creators</div>
                             <p class="type-body">{{ currentLevel.creators.join(', ') }}</p>
                           </template>
                           <template v-if="currentLevel.verifier">
                             <div class="type-title-sm">Verifier</div>
                             <p class="type-body">{{ currentLevel.verifier }}</p>
                           </template>
                        </div>
                        <iframe class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                        <ul class="stats">
                            <li>
                                <div class="type-label-lg">ID</div>
                                <p>{{ currentLevel.id }}</p>
                            </li>
                            <li>
                                <div class="type-label-lg">Password</div>
                                <p>{{ currentLevel.password || 'Free to Copy' }}</p>
                            </li>
                        </ul>
                    </template>
                    <h2>Pack Victors</h2>
                    <p v-if="!pack.records || pack.records.length === 0">No one has beaten this pack yet.</p>
                    <table v-else class="records">
                        <tr v-for="record in pack.records" class="record">
                            <td class="percent">
                                <p>100%</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                        </tr>
                    </table>
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
                        Packs are curated groups of levels on the list. Beat all levels in a pack in a single run without dying to complete it!
                    </p>
                    <p>
                        To complete a pack every level needs to be beaten without dying, shields, floatings or other powerups. Completion videos cannot have any edits or cuts
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
            return this.currentLevelEntry ? this.currentLevelEntry : null;
        },
        currentRank() {
            return this.currentLevelEntry ? this.currentLevelEntry : null;
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
        selectPack(i) {
            this.selectedPack = i;
            this.selectedLevel = 0;
        },
    },
};


