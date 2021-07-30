Vue.component('tab-button', {
    props: {
        id : String,
        display : String,
        show: Boolean
    },
    template: `
    <button @click="game.SetTab(id)" v-bind:class="{ 'current-tab': game.CheckTab(id) }" v-show="show">
        {{ display }}
    </button>`
})