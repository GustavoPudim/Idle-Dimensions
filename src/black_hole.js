const bhGrowth = 1.2
const bhGap = 50

function getBlackHolesForMatter(m) 
{
    return Decimal.floor(Decimal.pow(bhGrowth, Decimal.log(m).minus(bhGap)))
}

async function resetForBlackHoles(withAlert = true)
{
    if(withAlert)
    {
        const value = await swal({
            title: "Are you sure?",
            text: "You will lose your matter and all your dimensions",
            icon: "warning",
            buttons: true
        })
    
        if(!value) return
    }

    game.blackHoles = game.blackHoles.plus(getBlackHolesForMatter(game.matter))

    game.matter = Decimal(0)
    game.ClearDimensions()

    if(!game.blackHoleUpgrades.startBonus1.bought) return

    for(let i = 0; i < 4; i ++)
    {
        game.dimensions[i].amount = 1
    }

    if(!game.blackHoleUpgrades.startBonus2.bought) return

    for(let i = 4; i < game.dimensions.length; i ++)
    {
        game.dimensions[i].amount = 1
    }
}

class BlackHoleUpgrade
{
    text = ""
    price = Decimal(1)
    bought = false

    constructor(text, price)
    {   
        this.text = text
        this.price = price
    }

    buy()
    {
        if(game.blackHoles.gte(this.price) && !this.bought)
        {
            this.bought = true

            game.blackHoles = game.blackHoles.minus(this.price)
        }
    }
}