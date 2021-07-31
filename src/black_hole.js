const bhGrowth = 1.2
const bhGap = 50

function getBlackHolesForMatter(m) 
{
    return Decimal.floor(Decimal.pow(bhGrowth, Decimal.log(m).minus(bhGap)))
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