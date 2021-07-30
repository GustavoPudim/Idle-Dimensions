Vue.component('tab-button', {
    props: {
        id : String,
        display : String
    },
    template: `
    <button @click="game.SetTab(id)" v-bind:class="{ 'current-tab': game.CheckTab(id) }">
        {{ display }}
    </button>`
})