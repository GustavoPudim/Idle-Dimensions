function gameLoop ()
{
    let diff = (Date.now() - game.lastUpdate) / 1000
    game.lastUpdate = Date.now()
    
    game.IncreaseMatter(game.MatterPerSec().times(diff))

    game.dimensions.forEach(dimension => {
        dimension.mult = dimension.mult.plus(dimension.productionPerSec * diff)
    })
}