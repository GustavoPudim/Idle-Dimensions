function buyMaxDimensions(dimensions)
{
    for(let i = 0; i < dimensions.length; i ++)
    {
        let dim = dimensions[dimensions.length - i - 1]
        dim.buy(dim.maxBuy)
    }
}

class Dimension {
    
    static get costMultiplier() 
    { 
        return game.blackHoleUpgrades.dimensionCost.bought ? 1.7 : 1.8
    }
    static get prestigeBonus()
    {
        return game.blackHoleUpgrades.prestigeBonus.bought ? 15 : 10
    }
    static get prestigeGap()
    {
        return game.blackHoleUpgrades.prestigeGap.bought ? 90 : 100
    }
    static get prestigeCostMultiplier()
    {
        return game.blackHoleUpgrades.prestigeGap.bought ? Decimal('1e21') : (game.blackHoleUpgrades.dimensionCost.bought ? Decimal('1e24') : Decimal('1e29'))
    } 
    
    constructor (name, tier) {
        this.name = name
        this.tier = tier

        this.amount = 0
        this.mult = Decimal(1)
        this.prestiges = 0
    }

    get baseCost ()
    {
        let c = Decimal.pow(10, (this.tier) * (this.tier + 1) / 2) // Base cost without prestige
        let p = Decimal.pow(Dimension.prestigeCostMultiplier, this.prestiges) // Prestige cost multiplier
        let u = game.blackHoleUpgrades.baseDimensionCost.bought ? 0.1 : 1 // Black hole upgrade multiplier
        return c.times(p).times(u)
    }

    cost(amount = 1)
    {
        let a = this.amount // Amount
        let c = this.baseCost // Base Cost
        let i = Dimension.costMultiplier // Cost Increase
        let n = amount + this.amount // Wanted Amount

        // (c * (i^n - i^a)) / (i - 1)
        return c.times(Decimal.pow(i, n).minus(Decimal.pow(i, a))).div(i - 1) 
    }

    get canBuy() 
    {
        return game.matter.gte(this.cost)
    }

    canBuy(amount = 1) 
    {
        return game.matter.gte(this.cost(amount))
    }

    buyCap(amount = 1)
    {
        return Math.min(amount, Dimension.prestigeGap - this.amount)
    }

    get maxBuy()
    {
        let a = this.amount // Amount
        let c = this.baseCost // Base Cost
        let i = Dimension.costMultiplier // Cost Increase
        let m = game.matter // Current Matter

        // (m (i - 1) / (c)) + i ^ b
        let F = Decimal(i - 1).times(m).div(c).plus(Decimal.pow(i, a)) 

        // Min((ln(F) / ln(i)) - a, prestigeGap - a)
        return this.buyCap(Decimal.floor(Decimal.ln(F).div(Decimal.ln(i))).minus(a).toNumber())
    }

    
    buy(amount = 1)
    {
        let a = Math.min(this.maxBuy, amount)
        
        if(this.canBuy(a))
        {
            game.matter = game.matter.minus(this.cost(a))
            
            this.amount += a
        }
    }

    get productionPerSec()
    {
        let a = Decimal(this.amount + this.prestiges * Dimension.prestigeGap) // Real Amount
        let p = Decimal.pow(Dimension.prestigeBonus, this.prestiges) // Total prestige bonus
        let t = Decimal.pow(0.5, this.tier - 1) // Tier Debuff
        let u = game.blackHoleUpgrades.multBonus.bought ? game.blackHoles.div(1000).plus(1) : 1 // Black hole upgrade bonus

        return a.times(p).times(t).times(u)
    }
    
    prestige()
    {
        if(this.amount >= Dimension.prestigeGap)
        {
            this.amount = 0
            this.prestiges++
        }
    }

    asObject() 
    {
        let obj = {
            name: this.name,
            amount: this.amount,
            mult: this.mult.toString(),
            prestiges: this.prestiges,
            tier: this.tier
        }

        return obj
    }

    getDataFromObject(obj)
    {
        if(obj.name !== undefined) this.name = obj.name
        if(obj.amount !== undefined) this.amount = obj.amount
        if(obj.mult !== undefined) this.mult = Decimal(obj.mult)
        if(obj.prestiges !== undefined) this.prestiges = obj.prestiges
        if(obj.tier !== undefined) this.tier = obj.tier
    }

    clearData()
    {
        this.amount = 0
        this.mult = Decimal(1)
        this.prestiges = 0
    }

}
