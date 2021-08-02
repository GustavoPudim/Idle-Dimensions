function format(n)
{
    if(n.lte(1000)) return n.toFixed(2)
    power = Decimal.log10(n).floor()
    mantissa = n.div(Decimal.pow(10, power))
    return mantissa.toFixed(2) + "e" + power
}