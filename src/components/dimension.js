Vue.component('dimension', {
    props: {
        dim: Dimension
    },
    template: `<div class="dimension" v-show="dim.tier === 1 || game.dimensions[dim.tier - 2].amount > 0 || game.dimensions[dim.tier - 2].prestiges > 0">
        <div class="dimension-name"> {{ dim.name }} </div>
        <div class="dimension-amount">
            {{ dim.amount }} <span class="dimension-prestige" v-show="dim.prestiges > 0">({{ dim.prestiges }})</span>
        </div>
        <div class="dimension-mult">{{ game.Format(dim.mult) }}x</div>
        <div class="dimension-buy" >
            <button class="dimension-buy-button" @click="dim.buy(dim.buyCap(game.buyAmount))"
            v-show="dim.amount < Dimension.prestigeGap"
            v-bind:class="{ 'dimension-can-buy': dim.canBuy(dim.buyCap(game.buyAmount)) }">
            Buy {{ dim.buyCap(game.buyAmount) }} for {{ game.Format(dim.cost(dim.buyCap(game.buyAmount))) }} matter
            </button>
            <button class="dimension-prestige-button" @click="dim.prestige()" v-show="dim.amount >= Dimension.prestigeGap">
            Prestige for 10x bonus
            </button>
        </div>`
})