function saveGame(data)
{
    for(let key in data)
    {
        localStorage.setItem(key, data[key])
    }
}

function loadGame(keys)
{
    let data = {}

    keys.forEach(key => {
        data[key] = localStorage.getItem(key)
    })

    return data
}

function exportGame(data)
{
    return btoa(JSON.stringify(data))
}

function importGame(text)
{
    return JSON.parse(btoa(text))
}