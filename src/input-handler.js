window.addEventListener('keydown', (event) => {
    if(event.ctrlKey) 
    {
        game.buyAmount = 100
        return
    }
    if(event.shiftKey) 
    {
        game.buyAmount = 10
        return
    }
    game.buyAmount = 1
  })

window.addEventListener('keyup', (event) => {
    if(event.ctrlKey) 
    {
        game.buyAmount = 100
        return
    }
    if(event.shiftKey) 
    {
        game.buyAmount = 10
        return
    }
    game.buyAmount = 1
  })