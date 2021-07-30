const bhGrowth = 1.2
const bhGap = 50

function getBlackHolesForMatter(m) 
{
    return Decimal.floor(Decimal.pow(bhGrowth, Decimal.log(m).minus(bhGap)))
}